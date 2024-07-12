const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer'); // Asumimos que multer está configurado en `middlewares/multer.js`
const router = express.Router();

/**
 * @swagger
 * /api/users/premium/{uid}:
 *   put:
 *     summary: Cambia el rol de un usuario
 *     parameters:
 *       - name: uid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Rol del usuario actualizado
 *       400:
 *         description: El usuario no ha completado la carga de documentos requerida
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al cambiar el rol del usuario
 */
router.put('/premium/:uid', authMiddleware.isAdmin, userController.changeUserRole);

/**
 * @swagger
 * /api/users/{uid}/documents:
 *   post:
 *     summary: Subir documentos de usuario
 *     parameters:
 *       - name: uid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Documentos subidos correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al subir documentos
 */
router.post('/:uid/documents', upload.array('documents'), userController.uploadDocuments);

module.exports = router;

