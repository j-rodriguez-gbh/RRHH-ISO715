const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const { Empleado, Candidato, Puesto, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

class ReportService {
  async initialize() {
    // No initialization needed for Puppeteer
    console.log('Report service ready with Puppeteer');
  }

  async generateNewEmployeesReport(fechaInicio, fechaFin) {
    try {
      // Get employees within date range
      const empleados = await Empleado.findAll({
        where: {
          fecha_ingreso: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        },
        include: [
          {
            model: Candidato,
            attributes: ['nombres', 'apellidos', 'email', 'telefono', 'documento_identidad']
          },
          {
            model: Puesto,
            attributes: ['nombre', 'departamento', 'nivel']
          }
        ],
        order: [['fecha_ingreso', 'ASC']]
      });

      // Prepare data for report
      const reportData = {
        titulo: 'Reporte de Nuevos Empleados',
        fechaInicio: moment(fechaInicio).format('DD/MM/YYYY'),
        fechaFin: moment(fechaFin).format('DD/MM/YYYY'),
        fechaGeneracion: moment().format('DD/MM/YYYY HH:mm'),
        empleados: empleados.map(emp => ({
          codigo: emp.codigo_empleado,
          nombre: `${emp.Candidato.nombres} ${emp.Candidato.apellidos}`,
          email: emp.Candidato.email,
          telefono: emp.Candidato.telefono,
          documento: emp.Candidato.documento_identidad,
          puesto: emp.Puesto.nombre,
          departamento: emp.Puesto.departamento,
          nivel: emp.Puesto.nivel,
          fechaIngreso: moment(emp.fecha_ingreso).format('DD/MM/YYYY'),
          salario: emp.salario_acordado,
          tipoContrato: emp.tipo_contrato
        })),
        totalEmpleados: empleados.length
      };

      // HTML template for the report
      const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{titulo}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { margin-top: 20px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{titulo}}</h1>
        <h3>Período: {{fechaInicio}} - {{fechaFin}}</h3>
    </div>
    
    <div class="info">
        <p><strong>Fecha de generación:</strong> {{fechaGeneracion}}</p>
        <p><strong>Total de nuevos empleados:</strong> {{totalEmpleados}}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Documento</th>
                <th>Puesto</th>
                <th>Departamento</th>
                <th>Fecha Ingreso</th>
                <th>Salario</th>
                <th>Tipo Contrato</th>
            </tr>
        </thead>
        <tbody>
            {{#each empleados}}
            <tr>
                <td>{{codigo}}</td>
                <td>{{nombre}}</td>
                <td>{{email}}</td>
                <td>{{telefono}}</td>
                <td>{{documento}}</td>
                <td>{{puesto}}</td>
                <td>{{departamento}}</td>
                <td>{{fechaIngreso}}</td>
                <td>{{salario}}</td>
                <td>{{tipoContrato}}</td>
            </tr>
            {{/each}}
        </tbody>
    </table>

    <div class="footer">
        <p>Sistema de Gestión de RRHH - Generado automáticamente</p>
    </div>
</body>
</html>`;

      // Compile template and generate HTML
      const template = handlebars.compile(htmlTemplate);
      const html = template(reportData);

      // Generate PDF with Puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        printBackground: true
      });
      
      await browser.close();
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async generateCandidatesSummaryReport() {
    try {
      // Get candidates by state
      const candidatesByState = await Candidato.findAll({
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['estado']
      });

      const reportData = {
        titulo: 'Resumen de Candidatos por Estado',
        fechaGeneracion: moment().format('DD/MM/YYYY HH:mm'),
        estados: candidatesByState.map(item => ({
          estado: item.estado,
          cantidad: item.get('count')
        })),
        total: candidatesByState.reduce((sum, item) => sum + parseInt(item.get('count')), 0)
      };

      const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{titulo}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .chart { width: 100%; margin: 20px 0; }
        table { width: 50%; margin: 0 auto; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
        th { background-color: #f2f2f2; }
        .total { font-weight: bold; background-color: #e6f3ff; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{titulo}}</h1>
        <p><strong>Fecha de generación:</strong> {{fechaGeneracion}}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Estado</th>
                <th>Cantidad</th>
            </tr>
        </thead>
        <tbody>
            {{#each estados}}
            <tr>
                <td>{{estado}}</td>
                <td>{{cantidad}}</td>
            </tr>
            {{/each}}
            <tr class="total">
                <td><strong>TOTAL</strong></td>
                <td><strong>{{total}}</strong></td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;

      // Compile template and generate HTML
      const template = handlebars.compile(htmlTemplate);
      const html = template(reportData);

      // Generate PDF with Puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
        printBackground: true
      });
      
      await browser.close();
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating candidates summary report:', error);
      throw error;
    }
  }

  async close() {
    // No cleanup needed for Puppeteer
    console.log('Report service closed');
  }
}

module.exports = new ReportService(); 