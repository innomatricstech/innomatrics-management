import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Logo from "../assets/Logo 1.png"

const Payslip = () => {
  const payslipRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  // Company details (fixed as per requirements)
  const companyDetails = {
    name: "INNOMATRICS TECHNOLOGIES",
    address: "2nd Floor, Akshay Complex, No. 01,16th Main Rd, near Bharat Petroleum, BTM 2nd Stage, Bengaluru, Karnataka 560076",
    logo: Logo// Placeholder logo
  };

  const [data, setData] = useState({
    month: "Month",
    employeeName: "Name Of the Employee",
    employeeNumber: "KNV00255",
    dateJoined: "23 Dec 2024",
    department: "Engineering",
    subDepartment: "N/A",
    designation: "Jr SDE",
    secondaryJobTitle: "Mobile",
    paymentMode: "Bank Transfer",
    bankName: "ICICI Bank Limited",
    ifsc: "ICIC0000584",
    accountNo: "058401543400",
    uan: "N/A",
    pfNumber: "N/A",
    tanNumber: "SRTK07525A",
    panNumber: "CBTPV8574N",
    payableDays: "22.0",
    totalWorkingDays: "7.0",
    lossOfPayDays: "0.0",
    daysPayable: "7",
   earnings: {
  basic: "",
  hra: "",
  da: "",
  ta: ""
},
deductions: {
  lwf: "",
  professionalTax: ""
}

  });

  const handleChange = (path, value) => {
    setData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = updated;
      keys.slice(0, -1).forEach((k) => {
        if (!obj[k] || typeof obj[k] !== 'object') obj[k] = {};
        obj = obj[k];
      });
      obj[keys.at(-1)] = value;
      return updated;
    });
  };

  const parseNumber = (str) => {
    if (!str) return 0;
    return parseFloat(str.replace(/,/g, '')) || 0;
  };

  const totalEarnings = () => {
    return Object.values(data.earnings).reduce((sum, val) => sum + parseNumber(val), 0);
  };

  const totalContributions = () => {
    return parseNumber(data.deductions.lwf);
  };

  const totalTaxesDeductions = () => {
    return parseNumber(data.deductions.professionalTax);
  };

  const netSalary = () => {
    return totalEarnings() - totalContributions() - totalTaxesDeductions();
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const numberToWords = (num) => {
    if (!num || num === 0) return 'Zero';
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num >= 10000000) {
      const crores = Math.floor(num / 10000000);
      const remaining = num % 10000000;
      return `${numberToWords(crores)} Crore ${numberToWords(remaining)}`;
    }
    
    if (num >= 100000) {
      const lakhs = Math.floor(num / 100000);
      const remaining = num % 100000;
      return `${numberToWords(lakhs)} Lakh ${numberToWords(remaining)}`;
    }
    
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      const remaining = num % 1000;
      return `${numberToWords(thousands)} Thousand ${numberToWords(remaining)}`;
    }
    
    if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      const remaining = num % 100;
      return `${units[hundreds]} Hundred ${remaining > 0 ? 'and ' + numberToWords(remaining) : ''}`;
    }
    
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return `${tens[ten]} ${unit > 0 ? units[unit] : ''}`;
  };

  const downloadPayslip = async () => {
    if (!payslipRef.current) return;
    
    try {
      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`payslip-${data.month}-${data.employeeName}.pdf`);
      
    } catch (error) {
      console.error('Error downloading payslip:', error);
      alert('Error downloading payslip. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Control Panel */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Payslip Generator</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isEditing 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? 'Save & View' : 'Edit Details'}
            </button>
            <button
              onClick={downloadPayslip}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Payslip Preview - Exactly like the image */}
      <div ref={payslipRef} className="max-w-4xl mx-auto bg-white shadow-lg">
       
{/* Header with Logo and Company Details */}
<div className="relative px-6 py-6 border-b h-[160px]">

  {/* LEFT: PAYSLIP + COMPANY INFO */}
  <div>
    <h1 className="text-xl font-bold uppercase">
      PAYSLIP{" "}
      {isEditing ? (
        <>
          <input
            value={data.month}
            onChange={(e) => handleChange("month", e.target.value)}
            className="w-16 mx-1 text-black text-center border rounded px-1"
          />
          <input
            value={data.year}
            onChange={(e) => handleChange("year", e.target.value)}
            className="w-20 text-black text-center border rounded px-1"
          />
        </>
      ) : (
        <span className="font-normal">
          {data.month} {data.year}
        </span>
      )}
    </h1>

    <p className="font-bold mt-2">
      {companyDetails.name}
    </p>

    <p className="text-sm mt-1 leading-snug max-w-md">
      {companyDetails.address}
    </p>
  </div>

  {/* RIGHT: BIG LOGO (ABSOLUTE, ZOOMED, NO HEADER GROWTH) */}
  <img
    src={companyDetails.logo}
    alt="Company Logo"
    className="absolute right-6 top-1/2 -translate-y-1/2
               w-[200px] h-[180px] object-contain scale-150"
  />

</div>



     
        {/* Employee Name */}
<div className="p-4 border-b text-center bg-gray-50">
  {isEditing ? (
    <input
      type="text"
      value={data.employeeName}
      onChange={(e) => handleChange("employeeName", e.target.value)}
      className="text-xl font-bold uppercase text-center w-full border border-gray-300 rounded px-3 py-2"
    />
  ) : (
    <h2 className="text-xl font-bold uppercase">
      {data.employeeName}
    </h2>
  )}
</div>


        {/* Employee Details Table */}
        <div className="p-4">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              {/* Row 1 */}
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold w-1/4 bg-gray-50">Employee Number</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.employeeNumber}
                      onChange={(e) => handleChange("employeeNumber", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.employeeNumber
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold w-1/4 bg-gray-50">Date Joined</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.dateJoined}
                      onChange={(e) => handleChange("dateJoined", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.dateJoined
                  )}
                </td>
              </tr>
              {/* Row 2 */}
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Department</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.department
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Sub-Department</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.subDepartment}
                      onChange={(e) => handleChange("subDepartment", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.subDepartment
                  )}
                </td>
              </tr>
              {/* Row 3 */}
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Designation</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.designation}
                      onChange={(e) => handleChange("designation", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.designation
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Secondary Job Title</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.secondaryJobTitle}
                      onChange={(e) => handleChange("secondaryJobTitle", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.secondaryJobTitle
                  )}
                </td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Payment Mode</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.paymentMode}
                      onChange={(e) => handleChange("paymentMode", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.paymentMode
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Bank</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.bankName}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.bankName
                  )}
                </td>
              </tr>
              {/* Row 5 */}
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Bank IFSC</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.ifsc}
                      onChange={(e) => handleChange("ifsc", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.ifsc
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Bank Account</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.accountNo}
                      onChange={(e) => handleChange("accountNo", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.accountNo
                  )}
                </td>
              </tr>
              {/* Row 6 */}
              {/* <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">UAN</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.uan}
                      onChange={(e) => handleChange("uan", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.uan
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">PF Number</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.pfNumber}
                      onChange={(e) => handleChange("pfNumber", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.pfNumber
                  )}
                </td>
              </tr> */}
              {/* Row 7 */}
              {/* <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">TAN Number</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.tanNumber}
                      onChange={(e) => handleChange("tanNumber", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.tanNumber
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">PAN Number</td>
                <td className="border border-gray-300 px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.panNumber}
                      onChange={(e) => handleChange("panNumber", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    data.panNumber
                  )}
                </td>
              </tr> */}
            </tbody>
          </table>

          {/* Salary Details Section */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-bold mb-4">SALARY DETAILS</h3>
            <table className="w-full border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Actual Payable Days</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.payableDays}
                        onChange={(e) => handleChange("payableDays", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    ) : (
                      data.payableDays
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Total Working Days</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.totalWorkingDays}
                        onChange={(e) => handleChange("totalWorkingDays", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    ) : (
                      data.totalWorkingDays
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Loss Of Pay Days</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.lossOfPayDays}
                        onChange={(e) => handleChange("lossOfPayDays", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    ) : (
                      data.lossOfPayDays
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Days Payable</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.daysPayable}
                        onChange={(e) => handleChange("daysPayable", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    ) : (
                      data.daysPayable
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

         {/* Earnings & Deductions Section */}
<div className="mt-8">
  <div className="flex border border-gray-300">
    {/* Earnings Column */}
    <div className="flex-1 border-r border-gray-300 flex flex-col">
      <div className="text-center py-2 font-bold border-b border-gray-300 bg-gray-50 uppercase tracking-wider">
        Earnings
      </div>
      <div className="p-4 flex-grow">
        {/* Itemized List */}
        <div className="space-y-3">
          <div className="grid grid-cols-2">
            <span className="text-gray-700">Basic</span>
            <span className="font-semibold text-right">
              {isEditing ? (
                <input
                  type="text"
                  value={data.earnings.basic}
                  onChange={(e) => handleChange("earnings.basic", e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                />
              ) : (
                `₹${data.earnings.basic}`
              )}
            </span>
          </div>

          <div className="grid grid-cols-2">
            <span className="text-gray-700">Dearness Allowance</span>
            <span className="font-semibold text-right">
              {isEditing ? (
                <input
                  type="text"
                  value={data.earnings.da}
                  onChange={(e) => handleChange("earnings.da", e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                />
              ) : (
                `₹${data.earnings.da}`
              )}
            </span>
          </div>

          <div className="grid grid-cols-2">
            <span className="text-gray-700">Travelling Allowance</span>
            <span className="font-semibold text-right">
              {isEditing ? (
                <input
                  type="text"
                  value={data.earnings.ta}
                  onChange={(e) => handleChange("earnings.ta", e.target.value)}
                  className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                />
              ) : (
                `₹${data.earnings.ta}`
              )}
            </span>
          </div>
        </div>
      </div>
      {/* Total Earnings Row - Perfectly Aligned */}
      <div className="border-t border-gray-300 p-4 bg-gray-50/50">
        <div className="grid grid-cols-2 font-bold">
          <span>Total Earnings</span>
          <span className="text-right">₹{formatCurrency(totalEarnings())}</span>
        </div>
      </div>
    </div>

    {/* Deductions Column */}
    <div className="flex-1 flex flex-col">
      <div className="text-center py-2 font-bold border-b border-gray-300 bg-gray-50 uppercase tracking-wider">
        Taxes & Deductions
      </div>
      <div className="p-4 flex-grow">
        <div className="grid grid-cols-2">
          <span className="text-gray-700">Professional Tax</span>
          <span className="font-semibold text-right">
            {isEditing ? (
              <input
                type="text"
                value={data.deductions.professionalTax}
                onChange={(e) => handleChange("deductions.professionalTax", e.target.value)}
                className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
              />
            ) : (
              `₹${data.deductions.professionalTax}`
            )}
          </span>
        </div>
      </div>
      {/* Total Deductions Row - Perfectly Aligned */}
      <div className="border-t border-gray-300 p-4 bg-gray-50/50">
        <div className="grid grid-cols-2 font-bold">
          <span>Total Taxes & Deductions</span>
          <span className="text-right">₹{formatCurrency(totalTaxesDeductions())}</span>
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Net Salary Section */}
          <div className="mt-8 p-4 border border-gray-300">
            <div className="text-center mb-2">
              <p className="text-lg font-bold">
               Net Salary Payable (Total Earnings - Deductions) : ₹{formatCurrency(netSalary())}
              </p>
            </div>
            <div className="text-center">
              <p className="font-semibold">
                Net Salary in words: {numberToWords(Math.floor(netSalary()))} Rupees only
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4 text-center text-sm">
            <p>Note: All amounts displayed in this payslip are in INR</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-gray-800 mb-2">Instructions:</h3>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Click "Edit Details" to modify all fields</li>
          <li>Company name and address are fixed as per requirements</li>
          <li>All calculations update automatically</li>
          <li>Click "Download PDF" to save the payslip</li>
          <li>Click "Save & View" when finished editing</li>
        </ul>
      </div>
    </div>
  );
};

export default Payslip;