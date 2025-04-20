import { jsPDF } from 'jspdf';

interface PolicyData {
  id: string;
  title: string;
  description: string;
  area?: string;
}

interface ReflectionData {
  question: string;
  answer: string;
}

/**
 * Generate a PDF buffer containing policy and reflection data
 * @param policies Array of policy objects
 * @param reflections Array of reflection objects
 * @returns Buffer containing the generated PDF
 */
export async function generatePdfBuffer(
  policies: PolicyData[] = [],
  reflections: ReflectionData[] = []
): Promise<Buffer> {
  // Create a new PDF document
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Policy Challenge Summary', margin, y);
  y += 15;

  // Add policies section if there are any
  if (policies && policies.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Selected Policies', margin, y);
    y += 10;

    // Add each policy
    policies.forEach((policy, index) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${policy.title}${policy.area ? ` (${policy.area})` : ''}`, margin, y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      
      // Handle multi-line descriptions
      const splitDescription = doc.splitTextToSize(policy.description, 170);
      doc.text(splitDescription, margin, y);
      y += splitDescription.length * 7 + 5;

      // Add page break if needed
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  } else {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('No policies selected.', margin, y);
    y += 10;
  }

  // Add reflections section if there are any
  if (reflections && reflections.length > 0) {
    // Add page break if needed
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reflections', margin, y);
    y += 10;

    // Add each reflection
    reflections.forEach((reflection, index) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      
      // Handle multi-line questions
      const splitQuestion = doc.splitTextToSize(reflection.question, 170);
      doc.text(splitQuestion, margin, y);
      y += splitQuestion.length * 7;

      doc.setFont('helvetica', 'normal');
      
      // Handle multi-line answers
      const splitAnswer = doc.splitTextToSize(reflection.answer, 170);
      doc.text(splitAnswer, margin, y);
      y += splitAnswer.length * 7 + 10;

      // Add page break if needed
      if (y > 270 && index < reflections.length - 1) {
        doc.addPage();
        y = 20;
      }
    });
  } else {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('No reflections provided.', margin, y);
  }

  // Convert the PDF to a buffer
  return Buffer.from(doc.output('arraybuffer'));
}
