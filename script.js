
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let medicinesInventory = JSON.parse(localStorage.getItem('medicinesInventory')) || {};

function saveDataToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('medicinesInventory', JSON.stringify(medicinesInventory));
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function displayTransactions(transactionsToShow = transactions) {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    transactionsToShow.forEach((transaction, index) => {
        const profit = (transaction.sellingPrice - transaction.buyingPrice) * transaction.quantity;
        const totalAmount = transaction.quantity * transaction.sellingPrice;
        const amountPaid = transaction.amountPaid || 0;
        const amountPending = totalAmount - amountPaid;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${transaction.date}</td>
            <td>${transaction.customerName}</td>
            <td>${transaction.customerMobile}</td>
            <td>${transaction.medicine}</td>
            <td>${transaction.quantity}</td>
            <td>${transaction.buyingPrice}</td>
            <td>${transaction.sellingPrice}</td>
            <td>${profit}</td>
            <td>${amountPaid}</td>
            <td class="amount-pending" id="amountPending_${transaction.id}">${amountPending}</td>
            <td>${totalAmount}</td>
            <td class="actions">
                <button onclick="editTransaction(${index})">Edit</button>
                <button onclick="deleteTransaction(${index})">Delete</button>
            </td>
        `;

        const amountPendingElement = row.querySelector(`#amountPending_${transaction.id}`);
        if (amountPending > 0) {
            amountPendingElement.style.color = 'red';
        } else {
            amountPendingElement.style.color = 'black';
        }

        tableBody.appendChild(row);
    });
}

function displayInventory() {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    inventoryTableBody.innerHTML = '';

    const sortedMedicines = Object.keys(medicinesInventory).sort((a, b) => a.localeCompare(b));

    sortedMedicines.forEach((medicine, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${medicine}</td>
            <td>${medicinesInventory[medicine].quantity}</td>
            <td>${medicinesInventory[medicine].buyingPrice}</td>
            <td class="actions">
                <button onclick="editMedicine('${medicine}')">Edit</button>
                <button onclick="deleteMedicine('${medicine}')">Delete</button>
            </td>
        `;
        inventoryTableBody.appendChild(row);

        if (medicinesInventory[medicine].quantity === 0) {
            alert(`Alert: ${medicine} is out of stock.`);
        }
    });
}

document.getElementById('addTransactionBtn').addEventListener('click', () => {
    const customerName = prompt('Enter customer name:');
    const customerMobile = prompt('Enter customer mobile number:');
    const medicine = prompt('Enter medicine name:');
    const quantity = parseInt(prompt('Enter quantity sold:'), 10);
    const amountPaid = parseFloat(prompt('Enter amount paid:'));

    const date = formatDate(new Date());

    if (medicinesInventory[medicine] && medicinesInventory[medicine].quantity >= quantity) {
        const buyingPrice = medicinesInventory[medicine].buyingPrice;
        const sellingPrice = parseFloat(prompt('Enter selling price per unit:'));

        const transaction = {
            id: Date.now(),
            customerName,
            customerMobile,
            medicine,
            quantity,
            buyingPrice,
            sellingPrice,
            amountPaid,
            date
        };

        transactions.push(transaction);
        medicinesInventory[medicine].quantity -= quantity;
        saveDataToLocalStorage();
        displayTransactions();
        displayInventory();
    } else {
        alert('Either medicine not found in inventory or insufficient quantity.');
    }
});

document.getElementById('addMedicineBtn').addEventListener('click', () => {
    const medicineName = document.getElementById('medicineName').value.trim();
    const medicineQuantity = parseInt(document.getElementById('medicineQuantity').value, 10);
    const medicineBuyingPrice = parseFloat(document.getElementById('medicineBuyingPrice').value);

    if (medicineName && !isNaN(medicineQuantity) && !isNaN(medicineBuyingPrice)) {
        if (medicinesInventory[medicineName]) {
            medicinesInventory[medicineName].quantity += medicineQuantity;
            medicinesInventory[medicineName].buyingPrice = medicineBuyingPrice;
        } else {
            medicinesInventory[medicineName] = {
                quantity: medicineQuantity,
                buyingPrice: medicineBuyingPrice
            };
        }
        saveDataToLocalStorage();
        displayInventory();
    } else {
        alert('Please enter valid medicine name, quantity, and buying price.');
    }
});

function editTransaction(index) {
    const transaction = transactions[index];
    const newCustomerName = prompt('Edit customer name:', transaction.customerName);
    const newCustomerMobile = prompt('Edit customer mobile number:', transaction.customerMobile);
    const newMedicine = prompt('Edit medicine name:', transaction.medicine);
    const newQuantity = parseInt(prompt('Edit quantity sold:', transaction.quantity), 10);
    const newBuyingPrice = parseFloat(prompt('Edit buying price per unit:', transaction.buyingPrice));
    const newSellingPrice = parseFloat(prompt('Edit selling price per unit:', transaction.sellingPrice));
    const newAmountPaid = parseFloat(prompt('Edit amount paid:', transaction.amountPaid));
    const newDate = formatDate(new Date());

    transactions[index] = {
        ...transaction,
        customerName: newCustomerName,
        customerMobile: newCustomerMobile,
        medicine: newMedicine,
        quantity: newQuantity,
        buyingPrice: newBuyingPrice,
        sellingPrice: newSellingPrice,
        amountPaid: newAmountPaid,
        date: newDate
    };
    saveDataToLocalStorage();
    displayTransactions();
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveDataToLocalStorage();
    displayTransactions();
}

function editMedicine(medicine) {
    const newQuantity = parseInt(prompt('Edit quantity for ' + medicine + ':', medicinesInventory[medicine].quantity), 10);
    const newBuyingPrice = parseFloat(prompt('Edit buying price for ' + medicine + ':', medicinesInventory[medicine].buyingPrice));

    if (!isNaN(newQuantity) && !isNaN(newBuyingPrice)) {
        medicinesInventory[medicine].quantity = newQuantity;
        medicinesInventory[medicine].buyingPrice = newBuyingPrice;
        saveDataToLocalStorage();
        displayInventory();
    } else {
        alert('Please enter a valid quantity and buying price.');
    }
}

function deleteMedicine(medicine) {
    delete medicinesInventory[medicine];
    saveDataToLocalStorage();
    displayInventory();
}

document.getElementById('searchInput').addEventListener('input', function() {
    const searchText = this.value.toLowerCase();
    const filteredTransactions = transactions.filter(transaction => 
        transaction.customerName.toLowerCase().includes(searchText)
    );
    displayTransactions(filteredTransactions);
});

document.getElementById('generateReportBtn').addEventListener('click', () => {
    const medicineName = document.getElementById('reportMedicineName').value.trim().toLowerCase();
    const filteredTransactions = transactions.filter(transaction => transaction.medicine.toLowerCase() === medicineName);

    const monthlyReport = filteredTransactions.reduce((report, transaction) => {
        const [day, month, year] = transaction.date.split('/');
        const monthYear = `${month}/${year}`;

        if (!report[monthYear]) {
            report[monthYear] = { quantitySold: 0, totalSales: 0, totalProfit: 0 };
        }

        report[monthYear].quantitySold += transaction.quantity;
        report[monthYear].totalSales += transaction.quantity * transaction.sellingPrice;
        report[monthYear].totalProfit += (transaction.sellingPrice - transaction.buyingPrice) * transaction.quantity;

        return report;
    }, {});

    const reportTableBody = document.getElementById('salesReportTableBody');
    reportTableBody.innerHTML = '';

    Object.keys(monthlyReport).forEach(monthYear => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${monthYear}</td>
            <td>${monthlyReport[monthYear].quantitySold}</td>
            <td>${monthlyReport[monthYear].totalSales}</td>
            <td>${monthlyReport[monthYear].totalProfit}</td>
        `;
        reportTableBody.appendChild(row);
    });
});

document.getElementById('generateMonthlyProfitReportBtn').addEventListener('click', () => {
    const reportMonth = document.getElementById('reportMonth').value.trim();
    const filteredTransactions = transactions.filter(transaction => {
        const [day, month, year] = transaction.date.split('/');
        return `${month}/${year}` === reportMonth;
    });

    const totalProfit = filteredTransactions.reduce((profit, transaction) => {
        return profit + (transaction.sellingPrice - transaction.buyingPrice) * transaction.quantity;
    }, 0);

    const reportTableBody = document.getElementById('monthlyProfitReportTableBody');
    reportTableBody.innerHTML = '';

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${reportMonth}</td>
        <td>${totalProfit}</td>
    `;
    reportTableBody.appendChild(row);
});

document.addEventListener('DOMContentLoaded', () => {
    displayTransactions();
    displayInventory();
});
