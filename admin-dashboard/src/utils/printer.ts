export interface ReceiptData {
    businessName: string;
    address: string;
    phone?: string;
    rfc?: string;
    date: string;
    orderId: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    total: number;
    cashier?: string;
}

export const printReceipt = (data: ReceiptData) => {
    // Standard 58mm thermal paper width is approx 200-280px printable area
    // We'll use simple CSS for layout
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Recibo - ${data.businessName}</title>
        <style>
            body {
                font-family: 'Courier New', Courier, monospace; /* Monospaced is best for alignment */
                font-size: 12px;
                width: 58mm; /* Target standard thermal width */
                margin: 0;
                padding: 5px;
                color: black;
                background: white;
            }
            .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px dashed black;
                padding-bottom: 5px;
            }
            .header h2 {
                margin: 0;
                font-size: 16px;
                text-transform: uppercase;
            }
            .header p {
                margin: 2px 0;
                font-size: 10px;
            }
            .info {
                margin-bottom: 10px;
                font-size: 10px;
            }
            .items {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
            }
            .items th {
                text-align: left;
                border-bottom: 1px solid black;
                font-size: 10px;
            }
            .items td {
                padding: 2px 0;
                vertical-align: top;
            }
            .col-qty { width: 10%; }
            .col-item { width: 60%; }
            .col-price { width: 30%; text-align: right; }
            
            .totals {
                text-align: right;
                border-top: 1px dashed black;
                padding-top: 5px;
                margin-top: 5px;
            }
            .total-row {
                font-weight: bold;
                font-size: 14px;
                margin-top: 5px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>${data.businessName}</h2>
            <p>${data.address}</p>
            ${data.phone ? `<p>Tel: ${data.phone}</p>` : ''}
            ${data.rfc ? `<p>RFC: ${data.rfc}</p>` : ''}
        </div>
        
        <div class="info">
            <p>Fecha: ${data.date}</p>
            <p>Folio: #${data.orderId.slice(0, 8)}</p>
            ${data.cashier ? `<p>Cajero: ${data.cashier}</p>` : ''}
        </div>

        <table class="items">
            <thead>
                <tr>
                    <th class="col-qty">Cant</th>
                    <th class="col-item">Desc</th>
                    <th class="col-price">Total</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.quantity}</td>
                        <td>${item.name}</td>
                        <td class="col-price">$${item.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">TOTAL: $${data.total.toFixed(2)}</div>
        </div>

        <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>*** COPIA CLIENTE ***</p>
        </div>
        
        <script>
            window.onload = function() {
                window.print();
                // Optional: Close after print
                // window.close(); 
            }
        </script>
    </body>
    </html>
    `;

    // Open a new popup window
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close(); // Important for loading to finish
    } else {
        alert("Permite ventanas emergentes para imprimir el recibo");
    }
};
