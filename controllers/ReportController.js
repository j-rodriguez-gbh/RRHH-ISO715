const ReportService = require('../services/ReportService');
const Joi = require('joi');
const moment = require('moment');

class ReportController {
  static async newEmployeesReport(req, res) {
    try {
      const schema = Joi.object({
        fechaInicio: Joi.date().required(),
        fechaFin: Joi.date().required().greater(Joi.ref('fechaInicio'))
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { fechaInicio, fechaFin } = value;

      const reportBuffer = await ReportService.generateNewEmployeesReport(fechaInicio, fechaFin);

      const filename = `nuevos_empleados_${moment(fechaInicio).format('YYYY-MM-DD')}_${moment(fechaFin).format('YYYY-MM-DD')}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(reportBuffer);
    } catch (error) {
      console.error('Error generating new employees report:', error);
      res.status(500).json({ error: 'Error generando el reporte' });
    }
  }

  static async candidatesSummaryReport(req, res) {
    try {
      const reportBuffer = await ReportService.generateCandidatesSummaryReport();

      const filename = `resumen_candidatos_${moment().format('YYYY-MM-DD')}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(reportBuffer);
    } catch (error) {
      console.error('Error generating candidates summary report:', error);
      res.status(500).json({ error: 'Error generando el reporte' });
    }
  }
}

module.exports = ReportController; 