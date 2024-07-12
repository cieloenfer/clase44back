exports.changeUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.uid);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
    const uploadedDocuments = user.documents.map(doc => doc.name);

    const hasAllDocuments = requiredDocuments.every(doc => uploadedDocuments.includes(doc));
    if (!hasAllDocuments) {
      return res.status(400).json({ message: 'El usuario no ha completado la carga de documentos requerida' });
    }

    user.role = 'premium';
    await user.save();

    res.status(200).json({ message: 'Rol del usuario actualizado a premium' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el rol del usuario', error });
  }
};
