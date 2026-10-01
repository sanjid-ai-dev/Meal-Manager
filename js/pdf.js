// Ensure to include the html2pdf.js library in your project.
// You can add it via a CDN in your HTML file:
// <script src="https://cdn.jsdelivr.net/npm/html2pdf.js"></script>

// Function to save the entire website as a PDF
document.addEventListener('DOMContentLoaded', () => {
    const saveAsPDF = () => {
      // Select the entire body content to be converted to PDF
      const element = document.body;
  
      // Configure options for html2pdf
      const options = {
        margin: 0.5, // Margins in inches
        filename: 'website.pdf', // Name of the PDF file
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 }, // Higher scale for better quality
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
  
      // Generate and download the PDF
      html2pdf().set(options).from(element).save();
    };
  
    // Add a button to trigger the PDF download
    const button = document.createElement('button');
    button.textContent = 'Save as PDF';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    document.body.appendChild(button);
  
    // Attach the click event to the button
    button.addEventListener('click', saveAsPDF);
  });
  