"""
PDF Report Generator for Privacy Analysis
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from datetime import datetime
from io import BytesIO
from typing import Dict, List, Any


class PDFReportGenerator:
    """Generate professional PDF reports for privacy analysis"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
    
    def _create_custom_styles(self):
        """Create custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#3b82f6'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Risk level style
        self.styles.add(ParagraphStyle(
            name='RiskLevel',
            parent=self.styles['Normal'],
            fontSize=14,
            alignment=TA_CENTER,
            spaceAfter=20
        ))
        
        # Body text
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=11,
            alignment=TA_JUSTIFY,
            spaceAfter=10
        ))
    
    def generate_analysis_report(self, analysis_data: Dict[str, Any]) -> BytesIO:
        """
        Generate PDF report for privacy analysis
        
        Args:
            analysis_data: Analysis result data
            
        Returns:
            BytesIO buffer containing PDF
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18,
        )
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Add title
        title = Paragraph("Privacy Risk Analysis Report", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.2*inch))
        
        # Add timestamp
        timestamp = datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")
        date_text = Paragraph(f"<i>Generated on {timestamp}</i>", self.styles['CustomBody'])
        elements.append(date_text)
        elements.append(Spacer(1, 0.3*inch))
        
        # Risk Score Summary
        risk_score = analysis_data.get('risk_score', {})
        if risk_score:
            elements.append(self._create_risk_summary(risk_score))
            elements.append(Spacer(1, 0.3*inch))
        
        # Processing Stats
        processing_time = analysis_data.get('processing_time', 0)
        if processing_time:
            stats_text = Paragraph(
                f"<b>Analysis completed in:</b> {processing_time:.2f} seconds",
                self.styles['CustomBody']
            )
            elements.append(stats_text)
            elements.append(Spacer(1, 0.2*inch))
        
        # Detected PII Entities
        pii_entities = analysis_data.get('pii_entities', [])
        if pii_entities:
            elements.append(Paragraph("Detected Personal Information", self.styles['CustomSubtitle']))
            elements.append(self._create_pii_table(pii_entities))
            elements.append(Spacer(1, 0.3*inch))
        else:
            elements.append(Paragraph("Detected Personal Information", self.styles['CustomSubtitle']))
            elements.append(Paragraph(
                "✓ No personal identifiable information detected in your text.",
                self.styles['CustomBody']
            ))
            elements.append(Spacer(1, 0.3*inch))
        
        # Features Summary
        features = analysis_data.get('features', {})
        if features:
            elements.append(self._create_features_summary(features))
            elements.append(Spacer(1, 0.3*inch))
        
        # Recommendations
        recommendations = analysis_data.get('recommendations', [])
        if recommendations:
            elements.append(Paragraph("Privacy Recommendations", self.styles['CustomSubtitle']))
            for i, rec in enumerate(recommendations, 1):
                rec_text = Paragraph(f"{i}. {rec}", self.styles['CustomBody'])
                elements.append(rec_text)
            elements.append(Spacer(1, 0.3*inch))
        
        # Original Text
        input_text = analysis_data.get('input_text', '')
        if input_text:
            elements.append(PageBreak())
            elements.append(Paragraph("Original Text", self.styles['CustomSubtitle']))
            original_para = Paragraph(
                self._escape_html(input_text[:2000]),  # Limit length
                self.styles['CustomBody']
            )
            elements.append(original_para)
            elements.append(Spacer(1, 0.3*inch))
        
        # Safe Rewrite
        safe_rewrite = analysis_data.get('safe_rewrite')
        if safe_rewrite:
            elements.append(Paragraph("Privacy-Safe Rewrite", self.styles['CustomSubtitle']))
            rewrite_para = Paragraph(
                self._escape_html(safe_rewrite[:2000]),
                self.styles['CustomBody']
            )
            elements.append(rewrite_para)
            elements.append(Spacer(1, 0.3*inch))
        
        # Footer disclaimer
        elements.append(Spacer(1, 0.5*inch))
        disclaimer = Paragraph(
            "<i>This automated analysis is for informational purposes only. "
            "Always review your content manually before sharing sensitive information.</i>",
            self.styles['CustomBody']
        )
        elements.append(disclaimer)
        
        # Build PDF
        doc.build(elements)
        
        # Reset buffer position
        buffer.seek(0)
        return buffer
    
    def _create_risk_summary(self, risk_score: Dict) -> Table:
        """Create risk summary table"""
        score = risk_score.get('score', 0)
        level = risk_score.get('level', 'UNKNOWN')
        confidence = risk_score.get('confidence', 0)
        
        # Determine color based on risk level
        if level == 'LOW':
            color = colors.HexColor('#22c55e')
        elif level == 'MEDIUM':
            color = colors.HexColor('#eab308')
        else:
            color = colors.HexColor('#ef4444')
        
        data = [
            ['Risk Assessment Summary'],
            ['Risk Score', f'{score:.1f} / 100'],
            ['Risk Level', level],
            ['Confidence', f'{confidence * 100:.0f}%' if confidence else 'N/A']
        ]
        
        table = Table(data, colWidths=[2.5*inch, 2.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (1, 2), (1, 2), color),
            ('FONTNAME', (1, 2), (1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (1, 2), (1, 2), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
        ]))
        
        return table
    
    def _create_pii_table(self, pii_entities: List[Dict]) -> Table:
        """Create table of detected PII"""
        data = [['Type', 'Detected Text', 'Position']]
        
        for entity in pii_entities[:20]:  # Limit to 20 entities
            entity_type = entity.get('type', 'Unknown')
            text = entity.get('text', '')[:50]  # Limit text length
            start = entity.get('start', 0)
            end = entity.get('end', 0)
            
            data.append([
                entity_type,
                self._escape_html(text),
                f'{start}-{end}'
            ])
        
        table = Table(data, colWidths=[1.5*inch, 2.5*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
        ]))
        
        return table
    
    def _create_features_summary(self, features: Dict) -> Table:
        """Create features summary table"""
        data = [
            ['Feature', 'Count'],
            ['Email Addresses', features.get('num_emails', 0)],
            ['Phone Numbers', features.get('num_phones', 0)],
            ['Locations', features.get('num_locations', 0)],
            ['Person Names', features.get('num_persons', 0)],
            ['Organizations', features.get('num_organizations', 0)],
            ['Dates', features.get('num_dates', 0)],
            ['Text Length', f"{features.get('text_length', 0)} chars"],
            ['Entity Density', f"{features.get('entity_density', 0):.2%}"]
        ]
        
        table = Table(data, colWidths=[2.5*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
        ]))
        
        return table
    
    def _escape_html(self, text: str) -> str:
        """Escape HTML special characters for PDF"""
        if not text:
            return ""
        return (text
                .replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#39;'))


# Global instance
pdf_generator = PDFReportGenerator()
