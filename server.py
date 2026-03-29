"""
TaxGlue - Web-based Bookkeeping Application
Flask REST API + Static File Server
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import uuid
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Helper functions
def load_json(filepath, default=[]):
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return default

def save_json(filepath, data):
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

# TDS Data Files
TDS_DEDUCTORS_FILE = os.path.join(DATA_DIR, 'tds_deductors.json')
TDS_DEDUCTEES_FILE = os.path.join(DATA_DIR, 'tds_deductees.json')
TDS_TRANSACTIONS_FILE = os.path.join(DATA_DIR, 'tds_transactions.json')
TDS_CHALLANS_FILE = os.path.join(DATA_DIR, 'tds_challans.json')
TDS_RETURNS_FILE = os.path.join(DATA_DIR, 'tds_returns.json')

# Original App Data Files
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
CLIENTS_FILE = os.path.join(DATA_DIR, 'clients.json')
ACCOUNTS_FILE = os.path.join(DATA_DIR, 'accounts.json')
VOUCHERS_FILE = os.path.join(DATA_DIR, 'vouchers.json')

# TDS Section Rates (as per Indian Income Tax Act)
TDS_RATES = {
    '192': {'name': 'Salary', 'rate': None, 'description': 'TDS on Salary'},
    '194': {'name': 'Dividends', 'rate': 10, 'description': 'TDS on Dividends'},
    '194A': {'name': 'Interest other than Interest on securities', 'rate': 10, 'description': 'TDS on Interest'},
    '194C': {'name': 'Contractor Payment', 'rate': 2, 'description': 'TDS on Contractual Payments'},
    '194D': {'name': 'Insurance Commission', 'rate': 5, 'description': 'TDS on Insurance Commission'},
    '194H': {'name': 'Commission/Brokerage', 'rate': 5, 'description': 'TDS on Commission'},
    '194I': {'name': 'Rent', 'rate': 2, 'description': 'TDS on Rent'},
    '194IA': {'name': 'Transfer of Immovable Property', 'rate': 1, 'description': 'TDS on Property Transfer'},
    '194IB': {'name': 'Rent by Individual/HUF', 'rate': 5, 'description': 'TDS on Rent (Individual/HUF)'},
    '194J': {'name': 'Professional Fees', 'rate': 10, 'description': 'TDS on Professional Fees'},
    '194Q': {'name': 'Purchase of Goods', 'rate': 0.1, 'description': 'TDS on Purchase of Goods'},
    '195': {'name': 'Non-Resident Payments', 'rate': None, 'description': 'TDS on Non-Resident Payments'},
    '206AB': {'name': 'Higher TDS Rate (Non-filers)', 'rate': 5, 'description': 'Higher TDS for non-filers of ITR'}
}

# Form Types
FORM_TYPES = {
    '24Q': {'name': 'Form 24Q', 'description': 'TDS from Salary'},
    '26Q': {'name': 'Form 26Q', 'description': 'TDS from Non-Salary Payments'},
    '27Q': {'name': 'Form 27Q', 'description': 'TDS from Non-Resident Payments'}
}

# Initialize TDS data
def init_tds_data():
    # Initialize deductors if not exists
    if not os.path.exists(TDS_DEDUCTORS_FILE):
        save_json(TDS_DEDUCTORS_FILE, [])
    # Initialize deductees if not exists
    if not os.path.exists(TDS_DEDUCTEES_FILE):
        save_json(TDS_DEDUCTEES_FILE, [])
    # Initialize transactions if not exists
    if not os.path.exists(TDS_TRANSACTIONS_FILE):
        save_json(TDS_TRANSACTIONS_FILE, [])
    # Initialize challans if not exists
    if not os.path.exists(TDS_CHALLANS_FILE):
        save_json(TDS_CHALLANS_FILE, [])
    # Initialize returns if not exists
    if not os.path.exists(TDS_RETURNS_FILE):
        save_json(TDS_RETURNS_FILE, [])

init_tds_data()

# Helper functions (must be defined before init_data uses them)

# 1. TDS Deductor Management
@app.route('/api/tds/rates', methods=['GET'])
def get_tds_rates():
    """Get all TDS sections and their rates"""
    return jsonify(TDS_RATES)

@app.route('/api/tds/deductors', methods=['GET'])
def get_deductors():
    """Get all TDS deductors"""
    deductors = load_json(TDS_DEDUCTORS_FILE)
    return jsonify(deductors)

@app.route('/api/tds/deductors', methods=['POST'])
def create_deductor():
    """Create a new TDS deductor"""
    data = request.json
    deductor = {
        "id": str(uuid.uuid4()),
        "tan": data.get('tan', '').upper(),
        "name": data.get('name', ''),
        "ddo_type": data.get('ddo_type', 'NON_DDO'),
        "gstin": data.get('gstin', ''),
        "address": data.get('address', ''),
        "city": data.get('city', ''),
        "state": data.get('state', ''),
        "pincode": data.get('pincode', ''),
        "phone": data.get('phone', ''),
        "email": data.get('email', ''),
        "contact_person": data.get('contact_person', ''),
        "fy": data.get('fy', '2024-25'),
        "quarter": data.get('quarter', 'Q1'),
        "status": 'ACTIVE',
        "created_at": datetime.now().isoformat()
    }
    deductors = load_json(TDS_DEDUCTORS_FILE)
    deductors.append(deductor)
    save_json(TDS_DEDUCTORS_FILE, deductors)
    return jsonify(deductor), 201

@app.route('/api/tds/deductors/<deductor_id>', methods=['GET'])
def get_deductor(deductor_id):
    """Get a specific deductor"""
    deductors = load_json(TDS_DEDUCTORS_FILE)
    deductor = next((d for d in deductors if d['id'] == deductor_id), None)
    if deductor:
        return jsonify(deductor)
    return jsonify({"error": "Deductor not found"}), 404

@app.route('/api/tds/deductors/<deductor_id>', methods=['PUT'])
def update_deductor(deductor_id):
    """Update a deductor"""
    data = request.json
    deductors = load_json(TDS_DEDUCTORS_FILE)
    for i, d in enumerate(deductors):
        if d['id'] == deductor_id:
            deductors[i].update(data)
            deductors[i]['updated_at'] = datetime.now().isoformat()
            save_json(TDS_DEDUCTORS_FILE, deductors)
            return jsonify(deductors[i])
    return jsonify({"error": "Deductor not found"}), 404

@app.route('/api/tds/deductors/<deductor_id>', methods=['DELETE'])
def delete_deductor(deductor_id):
    """Delete a deductor"""
    deductors = load_json(TDS_DEDUCTORS_FILE)
    deductors = [d for d in deductors if d['id'] != deductor_id]
    save_json(TDS_DEDUCTORS_FILE, deductors)
    return jsonify({"message": "Deductor deleted"}), 200

# 2. TDS Deductee Management
@app.route('/api/tds/deductees', methods=['GET'])
def get_deductees():
    """Get all TDS deductees"""
    deductees = load_json(TDS_DEDUCTEES_FILE)
    return jsonify(deductees)

@app.route('/api/tds/deductees', methods=['POST'])
def create_deductee():
    """Create a new TDS deductee"""
    data = request.json
    deductee = {
        "id": str(uuid.uuid4()),
        "deductor_id": data.get('deductor_id'),
        "pan": data.get('pan', '').upper(),
        "aadhaar": data.get('aadhaar', ''),
        "name": data.get('name', ''),
        "address": data.get('address', ''),
        "city": data.get('city', ''),
        "state": data.get('state', ''),
        "pincode": data.get('pincode', ''),
        "mobile": data.get('mobile', ''),
        "email": data.get('email', ''),
        "category": data.get('category', 'INDIVIDUAL'),
        "deductee_type": data.get('deductee_type', 'RESIDENT'),
        "fy": data.get('fy', '2024-25'),
        "status": 'ACTIVE',
        "created_at": datetime.now().isoformat()
    }
    deductees = load_json(TDS_DEDUCTEES_FILE)
    deductees.append(deductee)
    save_json(TDS_DEDUCTEES_FILE, deductees)
    return jsonify(deductee), 201

@app.route('/api/tds/deductees/<deductee_id>', methods=['GET'])
def get_deductee(deductee_id):
    """Get a specific deductee"""
    deductees = load_json(TDS_DEDUCTEES_FILE)
    deductee = next((d for d in deductees if d['id'] == deductee_id), None)
    if deductee:
        return jsonify(deductee)
    return jsonify({"error": "Deductee not found"}), 404

@app.route('/api/tds/deductees/<deductee_id>', methods=['PUT'])
def update_deductee(deductee_id):
    """Update a deductee"""
    data = request.json
    deductees = load_json(TDS_DEDUCTEES_FILE)
    for i, d in enumerate(deductees):
        if d['id'] == deductee_id:
            deductees[i].update(data)
            deductees[i]['updated_at'] = datetime.now().isoformat()
            save_json(TDS_DEDUCTEES_FILE, deductees)
            return jsonify(deductees[i])
    return jsonify({"error": "Deductee not found"}), 404

@app.route('/api/tds/deductees/<deductee_id>', methods=['DELETE'])
def delete_deductee(deductee_id):
    """Delete a deductee"""
    deductees = load_json(TDS_DEDUCTEES_FILE)
    deductees = [d for d in deductees if d['id'] != deductee_id]
    save_json(TDS_DEDUCTEES_FILE, deductees)
    return jsonify({"message": "Deductee deleted"}), 200

# 3. TDS Transaction Engine
def calculate_tds(section, amount, deductee_pan=None, is_filer=True):
    """Calculate TDS based on section and amount"""
    if section not in TDS_RATES:
        return {"error": f"Invalid section: {section}"}
    
    section_info = TDS_RATES[section]
    
    # For salary section, rate is individual
    if section == '192':
        return {"tds_amount": 0, "rate": None, "message": "TDS on salary calculated separately"}
    
    # Check if deductee is non-filer (higher rate)
    rate = section_info['rate']
    if not is_filer and rate:
        rate = max(rate * 2, 5)  # Higher of 2x or 5%
    
    tds_amount = round(amount * rate / 100, 2) if rate else 0
    
    return {
        "tds_amount": tds_amount,
        "rate": rate,
        "net_payment": amount - tds_amount,
        "section_name": section_info['name']
    }

@app.route('/api/tds/calculate', methods=['POST'])
def calculate_tds_endpoint():
    """Calculate TDS for a transaction"""
    data = request.json
    section = data.get('section', '')
    amount = float(data.get('amount', 0))
    deductee_pan = data.get('deductee_pan', '')
    is_filer = data.get('is_filer', True)
    
    result = calculate_tds(section, amount, deductee_pan, is_filer)
    return jsonify(result)

@app.route('/api/tds/transactions', methods=['GET'])
def get_tds_transactions():
    """Get all TDS transactions"""
    transactions = load_json(TDS_TRANSACTIONS_FILE)
    
    # Apply filters
    deductor_id = request.args.get('deductor_id')
    deductee_id = request.args.get('deductee_id')
    fy = request.args.get('fy', '2024-25')
    section = request.args.get('section')
    quarter = request.args.get('quarter')
    
    if deductor_id:
        transactions = [t for t in transactions if t.get('deductor_id') == deductor_id]
    if deductee_id:
        transactions = [t for t in transactions if t.get('deductee_id') == deductee_id]
    if fy:
        transactions = [t for t in transactions if t.get('fy') == fy]
    if section:
        transactions = [t for t in transactions if t.get('section') == section]
    if quarter:
        transactions = [t for t in transactions if t.get('quarter') == quarter]
    
    return jsonify(transactions)

@app.route('/api/tds/transactions', methods=['POST'])
def create_tds_transaction():
    """Create a new TDS transaction"""
    data = request.json
    
    section = data.get('section', '')
    amount = float(data.get('amount', 0))
    deductee_pan = data.get('deductee_pan', '')
    is_filer = data.get('is_filer', True)
    
    # Calculate TDS
    calc_result = calculate_tds(section, amount, deductee_pan, is_filer)
    
    transaction = {
        "id": str(uuid.uuid4()),
        "deductor_id": data.get('deductor_id'),
        "deductee_id": data.get('deductee_id'),
        "section": section,
        "amount": amount,
        "tds_rate": calc_result.get('rate', 0),
        "tds_amount": calc_result.get('tds_amount', 0),
        "net_payment": calc_result.get('net_payment', amount),
        "payment_date": data.get('payment_date'),
        "invoice_number": data.get('invoice_number', ''),
        "nature_of_payment": data.get('nature_of_payment', ''),
        "fy": data.get('fy', '2024-25'),
        "quarter": data.get('quarter', 'Q1'),
        "challan_id": None,
        "status": 'UNPAID',
        "is_filer": is_filer,
        "created_at": datetime.now().isoformat()
    }
    
    transactions = load_json(TDS_TRANSACTIONS_FILE)
    transactions.append(transaction)
    save_json(TDS_TRANSACTIONS_FILE, transactions)
    
    return jsonify(transaction), 201

@app.route('/api/tds/transactions/<transaction_id>', methods=['GET'])
def get_tds_transaction(transaction_id):
    """Get a specific TDS transaction"""
    transactions = load_json(TDS_TRANSACTIONS_FILE)
    transaction = next((t for t in transactions if t['id'] == transaction_id), None)
    if transaction:
        return jsonify(transaction)
    return jsonify({"error": "Transaction not found"}), 404

@app.route('/api/tds/transactions/<transaction_id>', methods=['PUT'])
def update_tds_transaction(transaction_id):
    """Update a TDS transaction"""
    data = request.json
    transactions = load_json(TDS_TRANSACTIONS_FILE)
    
    for i, t in enumerate(transactions):
        if t['id'] == transaction_id:
            # Recalculate if amount or section changed
            if 'amount' in data or 'section' in data:
                section = data.get('section', t['section'])
                amount = float(data.get('amount', t['amount']))
                is_filer = data.get('is_filer', t.get('is_filer', True))
                calc_result = calculate_tds(section, amount, '', is_filer)
                data['tds_rate'] = calc_result.get('rate', 0)
                data['tds_amount'] = calc_result.get('tds_amount', 0)
                data['net_payment'] = calc_result.get('net_payment', amount)
            
            transactions[i].update(data)
            transactions[i]['updated_at'] = datetime.now().isoformat()
            save_json(TDS_TRANSACTIONS_FILE, transactions)
            return jsonify(transactions[i])
    
    return jsonify({"error": "Transaction not found"}), 404

@app.route('/api/tds/transactions/<transaction_id>', methods=['DELETE'])
def delete_tds_transaction(transaction_id):
    """Delete a TDS transaction"""
    transactions = load_json(TDS_TRANSACTIONS_FILE)
    transactions = [t for t in transactions if t['id'] != transaction_id]
    save_json(TDS_TRANSACTIONS_FILE, transactions)
    return jsonify({"message": "Transaction deleted"}), 200

# 4. TDS Challan Management
@app.route('/api/tds/challans', methods=['GET'])
def get_tds_challans():
    """Get all TDS challans"""
    challans = load_json(TDS_CHALLANS_FILE)
    return jsonify(challans)

@app.route('/api/tds/challans', methods=['POST'])
def create_tds_challan():
    """Create a new TDS challan"""
    data = request.json
    challan = {
        "id": str(uuid.uuid4()),
        "deductor_id": data.get('deductor_id'),
        "bsr_code": data.get('bsr_code', ''),
        "challan_serial": data.get('challan_serial', ''),
        "challan_date": data.get('challan_date'),
        "challan_amount": float(data.get('challan_amount', 0)),
        "tax_amount": float(data.get('tax_amount', 0)),
        "surcharge": float(data.get('surcharge', 0)),
        "education_cess": float(data.get('education_cess', 0)),
        "total_amount": float(data.get('total_amount', 0)),
        "bank_name": data.get('bank_name', ''),
        "status": 'DEPOSITED',
        "fy": data.get('fy', '2024-25'),
        "quarter": data.get('quarter', 'Q1'),
        "transaction_ids": data.get('transaction_ids', []),
        "created_at": datetime.now().isoformat()
    }
    
    # Update associated transactions
    transactions = load_json(TDS_TRANSACTIONS_FILE)
    for i, t in enumerate(transactions):
        if t['id'] in challan['transaction_ids']:
            transactions[i]['challan_id'] = challan['id']
            transactions[i]['status'] = 'PAID'
            transactions[i]['challan_date'] = challan['challan_date']
    save_json(TDS_TRANSACTIONS_FILE, transactions)
    
    challans = load_json(TDS_CHALLANS_FILE)
    challans.append(challan)
    save_json(TDS_CHALLANS_FILE, challans)
    
    return jsonify(challan), 201

@app.route('/api/tds/challans/<challan_id>', methods=['GET'])
def get_tds_challan(challan_id):
    """Get a specific TDS challan"""
    challans = load_json(TDS_CHALLANS_FILE)
    challan = next((c for c in challans if c['id'] == challan_id), None)
    if challan:
        return jsonify(challan)
    return jsonify({"error": "Challan not found"}), 404

# 5. TDS Return Preparation
@app.route('/api/tds/returns', methods=['GET'])
def get_tds_returns():
    """Get all TDS returns"""
    tds_returns = load_json(TDS_RETURNS_FILE)
    return jsonify(tds_returns)

@app.route('/api/tds/returns', methods=['POST'])
def create_tds_return():
    """Create a new TDS return"""
    data = request.json
    
    # Determine form type based on sections
    form_type = data.get('form_type', '26Q')
    quarter = data.get('quarter', 'Q1')
    fy = data.get('fy', '2024-25')
    deductor_id = data.get('deductor_id')
    
    # Get transactions for this deductor/quarter/fy
    transactions = load_json(TDS_TRANSACTIONS_FILE)
    return_transactions = [t for t in transactions 
                          if t.get('deductor_id') == deductor_id 
                          and t.get('quarter') == quarter 
                          and t.get('fy') == fy]
    
    # Calculate summary
    total_amount = sum(t.get('amount', 0) for t in return_transactions)
    total_tds = sum(t.get('tds_amount', 0) for t in return_transactions)
    
    # Group by section
    section_summary = {}
    for t in return_transactions:
        section = t.get('section', 'Unknown')
        if section not in section_summary:
            section_summary[section] = {
                'count': 0,
                'amount': 0,
                'tds': 0
            }
        section_summary[section]['count'] += 1
        section_summary[section]['amount'] += t.get('amount', 0)
        section_summary[section]['tds'] += t.get('tds_amount', 0)
    
    tds_return = {
        "id": str(uuid.uuid4()),
        "deductor_id": deductor_id,
        "form_type": form_type,
        "quarter": quarter,
        "fy": fy,
        "status": 'DRAFT',
        "total_transactions": len(return_transactions),
        "total_amount": total_amount,
        "total_tds": total_tds,
        "section_summary": section_summary,
        "file_data": None,
        "created_at": datetime.now().isoformat()
    }
    
    tds_returns = load_json(TDS_RETURNS_FILE)
    tds_returns.append(tds_return)
    save_json(TDS_RETURNS_FILE, tds_returns)
    
    return jsonify(tds_return), 201

@app.route('/api/tds/returns/<return_id>', methods=['GET'])
def get_tds_return(return_id):
    """Get a specific TDS return"""
    tds_returns = load_json(TDS_RETURNS_FILE)
    tds_return = next((r for r in tds_returns if r['id'] == return_id), None)
    if tds_return:
        return jsonify(tds_return)
    return jsonify({"error": "Return not found"}), 404

@app.route('/api/tds/returns/<return_id>/generate', methods=['POST'])
def generate_tds_return(return_id):
    """Generate TDS return file (NSDL RPU format)"""
    tds_returns = load_json(TDS_RETURNS_FILE)
    
    for i, r in enumerate(tds_returns):
        if r['id'] == return_id:
            # Get associated transactions
            transactions = load_json(TDS_TRANSACTIONS_FILE)
            return_transactions = [t for t in transactions 
                                  if t.get('deductor_id') == r['deductor_id'] 
                                  and t.get('quarter') == r['quarter'] 
                                  and t.get('fy') == r['fy']]
            
            # Generate file content
            file_content = generate_return_file(r, return_transactions)
            
            tds_returns[i]['file_data'] = file_content
            tds_returns[i]['status'] = 'GENERATED'
            tds_returns[i]['generated_at'] = datetime.now().isoformat()
            
            save_json(TDS_RETURNS_FILE, tds_returns)
            return jsonify(tds_returns[i])
    
    return jsonify({"error": "Return not found"}), 404

def generate_return_file(tds_return, transactions):
    """Generate TDS return file in text format (simplified NSDL format)"""
    lines = []
    lines.append(f"FORM TYPE: {tds_return.get('form_type', '26Q')}")
    lines.append(f"QUARTER: {tds_return.get('quarter', 'Q1')}")
    lines.append(f"FINANCIAL YEAR: {tds_return.get('fy', '2024-25')}")
    lines.append(f"TOTAL TRANSACTIONS: {tds_return.get('total_transactions', 0)}")
    lines.append(f"TOTAL AMOUNT: {tds_return.get('total_amount', 0)}")
    lines.append(f"TOTAL TDS: {tds_return.get('total_tds', 0)}")
    lines.append("")
    lines.append("DETAILS:")
    
    for t in transactions:
        lines.append(f"|{t.get('section', '')}|{t.get('amount', 0)}|{t.get('tds_amount', 0)}|{t.get('payment_date', '')}|{t.get('invoice_number', '')}|")
    
    return "\n".join(lines)

# 6. TDS Summary/Reports
@app.route('/api/tds/summary', methods=['GET'])
def get_tds_summary():
    """Get TDS summary report"""
    deductor_id = request.args.get('deductor_id')
    fy = request.args.get('fy', '2024-25')
    quarter = request.args.get('quarter')
    
    transactions = load_json(TDS_TRANSACTIONS_FILE)
    challans = load_json(TDS_CHALLANS_FILE)
    
    # Filter transactions
    filtered_txns = transactions
    if deductor_id:
        filtered_txns = [t for t in filtered_txns if t.get('deductor_id') == deductor_id]
    if fy:
        filtered_txns = [t for t in filtered_txns if t.get('fy') == fy]
    if quarter:
        filtered_txns = [t for t in filtered_txns if t.get('quarter') == quarter]
    
    # Calculate summary
    total_deduction = sum(t.get('tds_amount', 0) for t in filtered_txns)
    paid_tds = sum(t.get('tds_amount', 0) for t in filtered_txns if t.get('status') == 'PAID')
    unpaid_tds = total_deduction - paid_tds
    
    # Section-wise breakdown
    section_wise = {}
    for t in filtered_txns:
        section = t.get('section', 'Unknown')
        if section not in section_wise:
            section_wise[section] = {'count': 0, 'amount': 0, 'tds': 0}
        section_wise[section]['count'] += 1
        section_wise[section]['amount'] += t.get('amount', 0)
        section_wise[section]['tds'] += t.get('tds_amount', 0)
    
    # Challan summary
    filtered_challans = challans
    if deductor_id:
        filtered_challans = [c for c in filtered_challans if c.get('deductor_id') == deductor_id]
    if fy:
        filtered_challans = [c for c in filtered_challans if c.get('fy') == fy]
    
    total_deposited = sum(c.get('tax_amount', 0) for c in filtered_challans)
    
    return jsonify({
        "total_transactions": len(filtered_txns),
        "total_deduction": total_deduction,
        "total_deposited": total_deposited,
        "balance_due": total_deduction - total_deposited,
        "paid_tds": paid_tds,
        "unpaid_tds": unpaid_tds,
        "section_wise": section_wise,
        "challans": filtered_challans
    })

@app.route('/api/tds/form-types', methods=['GET'])
def get_form_types():
    """Get available TDS form types"""
    return jsonify(FORM_TYPES)

def init_data():
    if not os.path.exists(USERS_FILE):
        save_json(USERS_FILE, [
            {"id": str(uuid.uuid4()), "email": "admin@taxglue.com", "password": "admin123", "name": "Admin", "role": "admin"}
        ])

init_data()

# Auth routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    users = load_json(USERS_FILE)
    user = next((u for u in users if u['email'] == data.get('email')), None)
    if user and user['password'] == data.get('password'):
        return jsonify({"token": user['id'], "user": {"id": user['id'], "email": user['email'], "name": user['name'], "role": user['role']}})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    users = load_json(USERS_FILE)
    user = next((u for u in users if u['id'] == token), None)
    if user:
        return jsonify({"id": user['id'], "email": user['email'], "name": user['name'], "role": user['role']})
    return jsonify({"error": "Invalid token"}), 401

# Clients routes
@app.route('/api/clients', methods=['GET'])
def get_clients():
    clients = load_json(CLIENTS_FILE)
    return jsonify(clients)

@app.route('/api/clients', methods=['POST'])
def create_client():
    data = request.json
    client = {
        "id": str(uuid.uuid4()),
        "user_id": "admin",
        "name": data.get('name'),
        "email": data.get('email'),
        "phone": data.get('phone'),
        "address": data.get('address'),
        "gstin": data.get('gstin'),
        "fy": data.get('fy', '2024-25'),
        "created_at": datetime.now().isoformat()
    }
    clients = load_json(CLIENTS_FILE)
    clients.append(client)
    save_json(CLIENTS_FILE, clients)
    
    # Create default accounts
    default_accounts = [
        {"code": "001", "name": "Capital Account", "nature": "Liabilities", "type": "Capital"},
        {"code": "002", "name": "Cash in Hand", "nature": "Assets", "type": "Direct"},
        {"code": "003", "name": "Cash at Bank", "nature": "Assets", "type": "Direct"},
        {"code": "004", "name": "Sundry Debtors", "nature": "Assets", "type": "Direct"},
        {"code": "005", "name": "Sundry Creditors", "nature": "Liabilities", "type": "Direct"},
        {"code": "006", "name": "Sales", "nature": "Income", "type": "Revenue"},
        {"code": "007", "name": "Purchase", "nature": "Expense", "type": "Direct"},
        {"code": "008", "name": "Salaries", "nature": "Expense", "type": "Direct"},
        {"code": "009", "name": "Rent", "nature": "Expense", "type": "Indirect"},
        {"code": "010", "name": "Interest Received", "nature": "Income", "type": "Revenue"}
    ]
    accounts = load_json(ACCOUNTS_FILE)
    for acc in default_accounts:
        accounts.append({
            "id": str(uuid.uuid4()),
            "client_id": client['id'],
            "fy": client['fy'],
            "code": acc['code'],
            "name": acc['name'],
            "nature": acc['nature'],
            "account_type": acc['type'],
            "opening_balance": 0
        })
    save_json(ACCOUNTS_FILE, accounts)
    return jsonify(client)

# Accounts routes
@app.route('/api/accounts/<client_id>', methods=['GET'])
def get_accounts(client_id):
    fy = request.args.get('fy', '2024-25')
    accounts = load_json(ACCOUNTS_FILE)
    return jsonify([a for a in accounts if a.get('client_id') == client_id and a.get('fy') == fy])

@app.route('/api/accounts', methods=['POST'])
def create_account():
    data = request.json
    account = {
        "id": str(uuid.uuid4()),
        "client_id": data.get('client_id'),
        "fy": data.get('fy', '2024-25'),
        "code": data.get('code'),
        "name": data.get('name'),
        "nature": data.get('nature'),
        "account_type": data.get('account_type'),
        "opening_balance": data.get('opening_balance', 0)
    }
    accounts = load_json(ACCOUNTS_FILE)
    accounts.append(account)
    save_json(ACCOUNTS_FILE, accounts)
    return jsonify(account)

# Vouchers routes
@app.route('/api/vouchers/<client_id>', methods=['GET'])
def get_vouchers(client_id):
    fy = request.args.get('fy', '2024-25')
    vouchers = load_json(VOUCHERS_FILE)
    return jsonify([v for v in vouchers if v.get('client_id') == client_id and v.get('fy') == fy])

@app.route('/api/vouchers', methods=['POST'])
def create_voucher():
    data = request.json
    voucher = {
        "id": str(uuid.uuid4()),
        "client_id": data.get('client_id'),
        "fy": data.get('fy', '2024-25'),
        "date": data.get('date'),
        "voucher_no": data.get('voucher_no'),
        "voucher_type": data.get('voucher_type'),
        "narration": data.get('narration'),
        "lines": data.get('lines', []),
        "created_at": datetime.now().isoformat()
    }
    vouchers = load_json(VOUCHERS_FILE)
    vouchers.append(voucher)
    save_json(VOUCHERS_FILE, vouchers)
    return jsonify(voucher)

# Reports routes
@app.route('/api/reports/trial-balance/<client_id>', methods=['GET'])
def trial_balance(client_id):
    fy = request.args.get('fy', '2024-25')
    accounts = load_json(ACCOUNTS_FILE)
    vouchers = load_json(VOUCHERS_FILE)
    
    client_accounts = [a for a in accounts if a.get('client_id') == client_id and a.get('fy') == fy]
    client_vouchers = [v for v in vouchers if v.get('client_id') == client_id and v.get('fy') == fy]
    
    balances = {}
    for acc in client_accounts:
        balances[acc['id']] = {"code": acc['code'], "name": acc['name'], "nature": acc['nature'], "opening": acc.get('opening_balance', 0), "debit": 0, "credit": 0, "closing": acc.get('opening_balance', 0)}
    
    for v in client_vouchers:
        for line in v.get('lines', []):
            if line.get('account_id') in balances:
                if line.get('debit', 0) > 0:
                    balances[line['account_id']]['debit'] += line['debit']
                    balances[line['account_id']]['closing'] += line['debit']
                if line.get('credit', 0) > 0:
                    balances[line['account_id']]['credit'] += line['credit']
                    balances[line['account_id']]['closing'] -= line['credit']
    
    result = list(balances.values())
    totals = {"opening": sum(r['opening'] for r in result), "debit": sum(r['debit'] for r in result), "credit": sum(r['credit'] for r in result), "closing": sum(r['closing'] for r in result)}
    return jsonify({"accounts": result, "totals": totals})

@app.route('/api/reports/balance-sheet/<client_id>', methods=['GET'])
def balance_sheet(client_id):
    fy = request.args.get('fy', '2024-25')
    accounts = load_json(ACCOUNTS_FILE)
    vouchers = load_json(VOUCHERS_FILE)
    
    client_accounts = [a for a in accounts if a.get('client_id') == client_id and a.get('fy') == fy]
    client_vouchers = [v for v in vouchers if v.get('client_id') == client_id and v.get('fy') == fy]
    
    balances = {}
    for acc in client_accounts:
        balances[acc['id']] = {"name": acc['name'], "nature": acc['nature'], "balance": acc.get('opening_balance', 0)}
    
    for v in client_vouchers:
        for line in v.get('lines', []):
            if line.get('account_id') in balances:
                if line.get('debit', 0) > 0: balances[line['account_id']]['balance'] += line['debit']
                if line.get('credit', 0) > 0: balances[line['account_id']]['balance'] -= line['credit']
    
    result = list(balances.values())
    assets = sum(r['balance'] for r in result if r['nature'] == 'Assets')
    liabilities = sum(r['balance'] for r in result if r['nature'] == 'Liabilities')
    income = sum(r['balance'] for r in result if r['nature'] == 'Income')
    expenses = sum(r['balance'] for r in result if r['nature'] == 'Expense')
    
    return jsonify({
        "assets": [r for r in result if r['nature'] == 'Assets'],
        "liabilities": [r for r in result if r['nature'] == 'Liabilities'],
        "totals": {"assets": assets, "liabilities": liabilities + income - expenses}
    })

@app.route('/api/reports/profit-loss/<client_id>', methods=['GET'])
def profit_loss(client_id):
    fy = request.args.get('fy', '2024-25')
    accounts = load_json(ACCOUNTS_FILE)
    vouchers = load_json(VOUCHERS_FILE)
    
    client_accounts = [a for a in accounts if a.get('client_id') == client_id and a.get('fy') == fy]
    client_vouchers = [v for v in vouchers if v.get('client_id') == client_id and v.get('fy') == fy]
    
    balances = {}
    for acc in client_accounts:
        balances[acc['id']] = {"name": acc['name'], "nature": acc['nature'], "balance": acc.get('opening_balance', 0)}
    
    for v in client_vouchers:
        for line in v.get('lines', []):
            if line.get('account_id') in balances:
                if line.get('debit', 0) > 0: balances[line['account_id']]['balance'] += line['debit']
                if line.get('credit', 0) > 0: balances[line['account_id']]['balance'] -= line['credit']
    
    result = list(balances.values())
    income_list = [r for r in result if r['nature'] == 'Income']
    expense_list = [r for r in result if r['nature'] == 'Expense']
    total_income = sum(r['balance'] for r in income_list)
    total_expenses = sum(r['balance'] for r in expense_list)
    
    return jsonify({
        "income": income_list,
        "expenses": expense_list,
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "netProfit": total_income - total_expenses
    })

# ============ GST MODULE ============
GST_FILE = os.path.join(DATA_DIR, 'gst_data.json')

def load_gst_data():
    return load_json(GST_FILE, {
        "invoices": [],
        "returns": [],
        "ewaybills": [],
        "reconciliations": []
    })

def save_gst_data(data):
    save_json(GST_FILE, data)

@app.route('/api/gst/invoices', methods=['GET'])
def get_gst_invoices():
    """Get all GST invoices, optionally filtered by client_id and fy"""
    client_id = request.args.get('client_id')
    fy = request.args.get('fy', '2024-25')
    
    data = load_gst_data()
    invoices = data.get("invoices", [])
    
    # Filter by client_id if provided
    if client_id:
        invoices = [inv for inv in invoices if inv.get('client_id') == client_id]
    
    # Filter by fy if provided
    if fy:
        invoices = [inv for inv in invoices if inv.get('fy') == fy]
    
    return jsonify(invoices)

@app.route('/api/gst/invoices', methods=['POST'])
def create_gst_invoice():
    """Create a new GST invoice"""
    data = load_gst_data()
    invoice = request.json
    invoice["id"] = str(uuid.uuid4())
    invoice["created_at"] = datetime.now().isoformat()
    
    # Ensure client_id and fy are stored with the invoice
    if 'client_id' not in invoice:
        invoice['client_id'] = request.args.get('client_id', '')
    if 'fy' not in invoice:
        invoice['fy'] = request.args.get('fy', '2024-25')
    
    data["invoices"].append(invoice)
    save_gst_data(data)
    return jsonify(invoice), 201

@app.route('/api/gst/invoices/<invoice_id>', methods=['GET'])
def get_gst_invoice(invoice_id):
    """Get a specific invoice"""
    data = load_gst_data()
    for inv in data.get("invoices", []):
        if inv.get("id") == invoice_id:
            return jsonify(inv)
    return jsonify({"error": "Invoice not found"}), 404

@app.route('/api/gst/invoices/<invoice_id>', methods=['PUT'])
def update_gst_invoice(invoice_id):
    """Update an invoice"""
    data = load_gst_data()
    for i, inv in enumerate(data.get("invoices", [])):
        if inv.get("id") == invoice_id:
            data["invoices"][i].update(request.json)
            save_gst_data(data)
            return jsonify(data["invoices"][i])
    return jsonify({"error": "Invoice not found"}), 404

@app.route('/api/gst/invoices/<invoice_id>', methods=['DELETE'])
def delete_gst_invoice(invoice_id):
    """Delete an invoice"""
    data = load_gst_data()
    data["invoices"] = [inv for inv in data.get("invoices", []) if inv.get("id") != invoice_id]
    save_gst_data(data)
    return jsonify({"success": True})

# GST Returns
@app.route('/api/gst/returns', methods=['GET'])
def get_gst_returns():
    """Get all GST returns"""
    data = load_gst_data()
    return jsonify(data.get("returns", []))

@app.route('/api/gst/returns', methods=['POST'])
def create_gst_return():
    """Create a new GST return"""
    data = load_gst_data()
    gst_return = request.json
    gst_return["id"] = str(uuid.uuid4())
    gst_return["created_at"] = datetime.now().isoformat()
    data["returns"].append(gst_return)
    save_gst_data(data)
    return jsonify(gst_return), 201

@app.route('/api/gst/returns/<return_id>', methods=['GET'])
def get_gst_return(return_id):
    """Get a specific return"""
    data = load_gst_data()
    for ret in data.get("returns", []):
        if ret.get("id") == return_id:
            return jsonify(ret)
    return jsonify({"error": "Return not found"}), 404

@app.route('/api/gst/returns/<return_id>', methods=['PUT'])
def update_gst_return(return_id):
    """Update a GST return"""
    data = load_gst_data()
    for i, ret in enumerate(data.get("returns", [])):
        if ret.get("id") == return_id:
            data["returns"][i].update(request.json)
            save_gst_data(data)
            return jsonify(data["returns"][i])
    return jsonify({"error": "Return not found"}), 404

# E-way Bills
@app.route('/api/gst/ewaybills', methods=['GET'])
def get_ewaybills():
    """Get all e-way bills"""
    data = load_gst_data()
    return jsonify(data.get("ewaybills", []))

@app.route('/api/gst/ewaybills', methods=['POST'])
def create_ewaybill():
    """Create a new e-way bill"""
    data = load_gst_data()
    ewaybill = request.json
    ewaybill["id"] = str(uuid.uuid4())
    ewaybill["created_at"] = datetime.now().isoformat()
    data["ewaybills"].append(ewaybill)
    save_gst_data(data)
    return jsonify(ewaybill), 201

# GST Summary
@app.route('/api/gst/summary', methods=['GET'])
def get_gst_summary():
    """Get GST summary for a period"""
    data = load_gst_data()
    invoices = data.get("invoices", [])
    
    total_output_gst = sum(inv.get("cgst", 0) + inv.get("sgst", 0) + inv.get("igst", 0) for inv in invoices)
    total_igst = sum(inv.get("igst", 0) for inv in invoices)
    total_cgst = sum(inv.get("cgst", 0) for inv in invoices)
    total_sgst = sum(inv.get("sgst", 0) for inv in invoices)
    
    return jsonify({
        "total_invoices": len(invoices),
        "total_output_gst": total_output_gst,
        "total_igst": total_igst,
        "total_cgst": total_cgst,
        "total_sgst": total_sgst,
        "total_taxable_value": sum(inv.get("taxable_value", 0) for inv in invoices)
    })

# GST Rates
GST_RATES = {
    "0": {"name": "Nil Rate", "rate": 0},
    "0.25": {"name": "Lower Rate", "rate": 0.25},
    "3": {"name": "Standard Rate", "rate": 3},
    "5": {"name": "Standard Rate", "rate": 5},
    "12": {"name": "Standard Rate", "rate": 12},
    "18": {"name": "Standard Rate", "rate": 18},
    "28": {"name": "Highest Rate", "rate": 28}
}

@app.route('/api/gst/rates', methods=['GET'])
def get_gst_rates():
    """Get GST rates"""
    return jsonify(GST_RATES)

# ============ INCOME TAX MODULE ============
IT_FILE = os.path.join(DATA_DIR, 'income_tax_data.json')

def load_it_data():
    return load_json(IT_FILE, {
        "itr_filings": [],
        "assessments": [],
        "form16": [],
        "computations": []
    })

def save_it_data(data):
    save_json(IT_FILE, data)

@app.route('/api/it/itr', methods=['GET'])
def get_itr_filings():
    """Get all ITR filings"""
    data = load_it_data()
    return jsonify(data.get("itr_filings", []))

@app.route('/api/it/itr', methods=['POST'])
def create_itr_filing():
    """Create a new ITR filing"""
    data = load_it_data()
    itr = request.json
    itr["id"] = str(uuid.uuid4())
    itr["created_at"] = datetime.now().isoformat()
    data["itr_filings"].append(itr)
    save_it_data(data)
    return jsonify(itr), 201

@app.route('/api/it/itr/<itr_id>', methods=['GET'])
def get_itr_filing(itr_id):
    """Get a specific ITR filing"""
    data = load_it_data()
    for itr in data.get("itr_filings", []):
        if itr.get("id") == itr_id:
            return jsonify(itr)
    return jsonify({"error": "ITR not found"}), 404

@app.route('/api/it/itr/<itr_id>', methods=['PUT'])
def update_itr_filing(itr_id):
    """Update an ITR filing"""
    data = load_it_data()
    for i, itr in enumerate(data.get("itr_filings", [])):
        if itr.get("id") == itr_id:
            data["itr_filings"][i].update(request.json)
            save_it_data(data)
            return jsonify(data["itr_filings"][i])
    return jsonify({"error": "ITR not found"}), 404

@app.route('/api/it/form16', methods=['GET'])
def get_form16():
    """Get all Form 16 certificates"""
    data = load_it_data()
    return jsonify(data.get("form16", []))

@app.route('/api/it/form16', methods=['POST'])
def create_form16():
    """Create a new Form 16"""
    data = load_it_data()
    form16 = request.json
    form16["id"] = str(uuid.uuid4())
    form16["created_at"] = datetime.now().isoformat()
    data["form16"].append(form16)
    save_it_data(data)
    return jsonify(form16), 201

@app.route('/api/it/summary', methods=['GET'])
def get_it_summary():
    """Get Income Tax summary"""
    data = load_it_data()
    itr_filings = data.get("itr_filings", [])
    form16_list = data.get("form16", [])
    
    return jsonify({
        "total_itr_filings": len(itr_filings),
        "total_form16": len(form16_list),
        "pending_filings": len([itr for itr in itr_filings if itr.get("status") == "pending"])
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

# Serve frontend
@app.route('/')
def serve_index():
    return send_from_directory('templates', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join('templates', path)):
        return send_from_directory('templates', path)
    return send_from_directory('templates', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)


# ============================================
# Vercel Serverless Handler
# ============================================
# Vercel Python runtime expects either:
# 1. A handler(request) function that returns a Response tuple
# 2. A WSGI app that can be used directly

# For Flask on Vercel, we return the Flask app as a WSGI application
# Vercel will handle the request/response translation
def handler(request):
    """
    Vercel serverless handler function.
    
    For Flask apps on Vercel, we can return the app directly as a WSGI app,
    or process the request and return a tuple (body, status, headers).
    """
    # Get method and path from Vercel request object
    method = request.get('method', 'GET')
    path = request.get('path', '/')
    
    # Extract headers
    headers = {}
    for key, value in request.get('headers', {}).items():
        headers[key.lower()] = value
    
    # Get body if available
    body = request.get('body', '')
    if body and isinstance(body, bytes):
        body = body.decode('utf-8')
    
    # Import Flask test client for handling the request
    with app.test_client() as client:
        # Make the request to Flask
        response = client.open(
            path=path,
            method=method,
            headers=headers,
            data=body
        )
        
        # Return in Vercel format: (body, status_code, headers)
        return (
            response.get_data(as_text=True),
            response.status_code,
            dict(response.headers)
        )


# Alternative: Export app directly as WSGI for Vercel to handle
# This is simpler and often more reliable
wsgi_app = app
