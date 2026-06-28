const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/PosterDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacementUI = `<div className="py-6 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                          <div className="w-16 h-16 mb-4 animate-pulse bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📱</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Check Your Phone</h4>
                          <p className="text-gray-600 text-sm text-center mb-6">
                            We've sent an STK Push to your phone. Enter your PIN to complete the deposit.
                          </p>
                          {escrowMessage && (
                            <p className="text-amber-600 text-sm mb-4 font-medium bg-amber-50 p-2 rounded-lg text-center w-full">{escrowMessage}</p>
                          )}
                          <Button 
                            className="w-full bg-[#131ADF] font-bold"
                            onClick={handleCheckEscrowPayment}
                            disabled={isCheckingPayment}
                          >
                            {isCheckingPayment ? 'Checking...' : 'I Have Paid'}
                          </Button>
                        </div>`;

const regex = /<div className="py-6 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">[\s\S]*?We've sent an STK Push to your phone\. Enter your PIN to complete the deposit\.[\s\S]*?<\/div>/;

if (regex.test(content)) {
  content = content.replace(regex, replacementUI);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Replaced PosterDashboard UI');
} else {
  console.log('Failed to match PosterDashboard UI');
}
