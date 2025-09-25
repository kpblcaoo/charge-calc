import pandas as pd
import tkinter as tk
from tkinter import filedialog, messagebox

def calculate_charge(dp_list):
    if not dp_list:
        return 0.0
    # Try to use the last charge value if available
    last_charge = None
    for dp in reversed(dp_list):
        if dp['charge'] is not None:
            last_charge = dp['charge']
            break
    if last_charge is not None:
        return last_charge
    # Otherwise, calculate integral
    times = [d['time'] for d in dp_list]
    currents = [d['current'] for d in dp_list]
    if all(abs(c - currents[0]) < 1e-9 for c in currents):  # constant current
        return currents[0] * (times[-1] - times[0])
    else:
        # variable current, trapezoidal integration
        q = 0.0
        for i in range(len(times) - 1):
            dt = times[i + 1] - times[i]
            q += (currents[i] + currents[i + 1]) / 2 * dt
        return q

def parse_file(file_path):
    df = pd.read_excel(file_path, header=None)
    data = []
    current_cycle = None
    current_step = None
    step_data = []

    for row in df.itertuples(index=False):
        key = str(row[0]).strip() if pd.notna(row[0]) else ''
        if key == 'cy':
            if current_cycle is not None and current_step is not None:
                data[-1]['steps'].append({'step': current_step, 'dp': step_data})
            current_cycle = int(row[1]) if pd.notna(row[1]) else 0
            data.append({'cycle': current_cycle, 'steps': []})
            current_step = None
            step_data = []
        elif key == 'st':
            if current_step is not None:
                data[-1]['steps'].append({'step': current_step, 'dp': step_data})
            current_step = int(row[1]) if pd.notna(row[1]) else 0
            step_data = []
        elif key == 'dp':
            try:
                time_val = float(row[1]) if pd.notna(row[1]) else 0
                voltage = float(row[2]) if pd.notna(row[2]) else 0
                current_val = float(row[3]) if pd.notna(row[3]) else 0
                charge = float(row[5]) if len(row) > 5 and pd.notna(row[5]) else None
                step_data.append({'time': time_val, 'voltage': voltage, 'current': current_val, 'charge': charge})
            except (ValueError, IndexError):
                pass  # skip invalid dp rows
        elif key == 'de':
            if current_step is not None:
                data[-1]['steps'].append({'step': current_step, 'dp': step_data})
                current_step = None
                step_data = []

    # Process last step if any
    if current_step is not None and data:
        data[-1]['steps'].append({'step': current_step, 'dp': step_data})

    return data

def main_gui():
    root = tk.Tk()
    root.title("Charge Calculator")

    file_path = None
    results_data = None

    def select_file():
        nonlocal file_path
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        if file_path:
            file_label.config(text=f"Selected: {file_path}")

    select_button = tk.Button(root, text="Select Excel File", command=select_file)
    select_button.pack()

    file_label = tk.Label(root, text="No file selected")
    file_label.pack()

    results_text = tk.Text(root, height=20, width=80)
    results_text.pack()

    def calculate():
        nonlocal results_data
        if not file_path:
            messagebox.showerror("Error", "Please select a file first")
            return
        try:
            data = parse_file(file_path)
            results = []
            for cycle in data:
                results.append([f"Cycle {cycle['cycle']}", "", ""])
                for step in cycle['steps']:
                    q = calculate_charge(step['dp'])
                    results.append(["", f"Step {step['step']}", f"{q:.6f}"])
                total_q = sum(calculate_charge(step['dp']) for step in cycle['steps'])
                results.append(["", "Total", f"{total_q:.6f}"])
            # Display
            results_text.delete(1.0, tk.END)
            for row in results:
                results_text.insert(tk.END, f"{row[0]}\t{row[1]}\t{row[2]}\n")
            results_data = results
        except Exception as e:
            messagebox.showerror("Error", str(e))

    calc_button = tk.Button(root, text="Calculate", command=calculate)
    calc_button.pack()

    def export_csv():
        if not results_data:
            messagebox.showerror("Error", "No results to export")
            return
        file = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV files", "*.csv")])
        if file:
            import csv
            with open(file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerows(results_data)
            messagebox.showinfo("Success", "Exported to CSV")

    def export_excel():
        if not results_data:
            messagebox.showerror("Error", "No results to export")
            return
        file = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel files", "*.xlsx")])
        if file:
            df = pd.DataFrame(results_data, columns=["Cycle", "Step", "Charge"])
            df.to_excel(file, index=False)
            messagebox.showinfo("Success", "Exported to Excel")

    csv_button = tk.Button(root, text="Export to CSV", command=export_csv)
    csv_button.pack()

    excel_button = tk.Button(root, text="Export to Excel", command=export_excel)
    excel_button.pack()

    root.mainloop()

if __name__ == "__main__":
    main_gui()