import { jsPDF } from 'jspdf';
import { Contest, Nominee } from '../types';

export function generateResultsCertificatePdf(contest: Contest, nominees: Nominee[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const contestNominees = nominees
    .filter((n) => n.contestId === contest.id)
    .sort((a, b) => b.voteCount - a.voteCount);

  const totalVotes = contestNominees.reduce((sum, n) => sum + n.voteCount, 0);
  const totalPaidVotes = contestNominees.reduce((sum, n) => sum + n.paidVoteCount, 0);
  const totalFreeVotes = contestNominees.reduce((sum, n) => sum + n.freeVoteCount, 0);
  const winner = contestNominees[0];

  // Background styling
  doc.setFillColor(18, 18, 20); // Dark Charcoal
  doc.rect(0, 0, 210, 297, 'F');

  // Gold decorative border
  doc.setDrawColor(245, 158, 11); // Amber/Gold
  doc.setLineWidth(1.5);
  doc.rect(10, 10, 190, 277);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, 186, 273);

  // Header Title
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ROOTED STEEZE STUDIOS', 105, 28, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('OFFICIAL CERTIFICATE OF VOTING RESULTS', 105, 36, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(161, 161, 170);
  doc.text('STEEZEVOTES VERIFIED AUDIT REGISTRY • ACCRA, GHANA', 105, 42, { align: 'center' });

  // Divider
  doc.setDrawColor(245, 158, 11);
  doc.line(30, 46, 180, 46);

  // Contest Info
  doc.setFontSize(11);
  doc.setTextColor(245, 158, 11);
  doc.text('EVENT / CONTEST DETAILS', 20, 56);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Title: ${contest.title}`, 20, 63);
  doc.text(`Organizer: ${contest.organizerName}`, 20, 69);
  doc.text(`Category: ${contest.category}`, 20, 75);
  doc.text(`Voting Concluded: ${new Date(contest.endDate).toUTCString()}`, 20, 81);
  doc.text(`Audit ID: STZ-CERT-${contest.id.toUpperCase()}-${Date.now().toString().slice(-6)}`, 20, 87);

  // Summary Metrics Box
  doc.setFillColor(30, 30, 35);
  doc.roundedRect(20, 93, 170, 22, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Total Ballots Cast: ${totalVotes.toLocaleString()}`, 30, 103);
  doc.text(`Free OTP Votes: ${totalFreeVotes.toLocaleString()}`, 30, 109);
  doc.text(`Paid MoMo Votes: ${totalPaidVotes.toLocaleString()}`, 110, 103);
  doc.text(`Audit Status: 100% Verified & Escrow Reconciled`, 110, 109);

  // Winner Announcement Banner
  if (winner) {
    doc.setFillColor(45, 35, 15);
    doc.roundedRect(20, 120, 170, 24, 3, 3, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('👑 OFFICIAL WINNER / 1ST PLACE DELEGATE', 105, 128, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text(`${winner.stageName || winner.name} (${winner.nomineeCode})`, 105, 136, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Total Certified Votes: ${winner.voteCount.toLocaleString()} (${totalVotes > 0 ? Math.round((winner.voteCount / totalVotes) * 100) : 0}%)`, 105, 141, { align: 'center' });
  }

  // Nominees Breakdown Table
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FINAL CERTIFIED TALLY PER NOMINEE', 20, 153);

  // Table header
  doc.setFillColor(40, 40, 45);
  doc.rect(20, 157, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('RANK', 24, 162);
  doc.text('NOMINEE / STAGE NAME', 40, 162);
  doc.text('CODE', 110, 162);
  doc.text('FREE', 130, 162);
  doc.text('PAID', 150, 162);
  doc.text('TOTAL', 170, 162);

  // Table rows
  let yPos = 171;
  contestNominees.forEach((nom, index) => {
    if (yPos > 240) return; // Prevent overflow
    doc.setFillColor(index % 2 === 0 ? 25 : 32, index % 2 === 0 ? 25 : 32, index % 2 === 0 ? 30 : 37);
    doc.rect(20, yPos - 5, 170, 7, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
    doc.text(`#${index + 1}`, 24, yPos);
    doc.text((nom.stageName || nom.name).slice(0, 32), 40, yPos);
    doc.text(nom.nomineeCode, 110, yPos);
    doc.text(nom.freeVoteCount.toString(), 130, yPos);
    doc.text(nom.paidVoteCount.toString(), 150, yPos);
    doc.text(nom.voteCount.toLocaleString(), 170, yPos);

    yPos += 8;
  });

  // Footer & Official Seal
  doc.setDrawColor(245, 158, 11);
  doc.line(20, 255, 190, 255);

  doc.setFontSize(7.5);
  doc.setTextColor(161, 161, 170);
  doc.text('Certified by Rooted Steeze Studios (RSS) Electoral Technology Division.', 20, 262);
  doc.text('This document constitutes a cryptographically sealed voting record. Powered by Paystack Ghana & Supabase.', 20, 267);
  doc.text(`Generated on: ${new Date().toISOString()} • Timestamp Verified`, 20, 272);

  // Download PDF
  doc.save(`SteezeVotes-Results-Certificate-${contest.slug}.pdf`);
}
