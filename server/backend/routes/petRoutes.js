const express = require('express');
const router = express.Router();
const { 
  getPetsByOwner, 
  getPetById, 
  addPet, 
  updatePet, 
  deletePet, 
  addVaccine, 
  addMedicalRecord 
} = require('../controllers/petController');

// Map CRUD pet routing endpoints
router.get('/owner/:ownerId', getPetsByOwner);
router.get('/:petId', getPetById);
router.post('/', addPet);
router.put('/:petId', updatePet);
router.delete('/:petId', deletePet);
router.post('/:petId/vaccine', addVaccine);
router.post('/:petId/medical-record', addMedicalRecord);

module.exports = router;
