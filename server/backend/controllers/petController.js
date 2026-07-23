const Pet = require('../models/Pet');

// @desc    Get all pets belonging to a specific owner
// @route   GET /api/pets/owner/:ownerId
// @access  Public
exports.getPetsByOwner = async (req, res) => {
  try {
    const pets = await Pet.find({ 
      owner: req.params.ownerId,
      activeStatus: { $ne: 'ARCHIVED' }
    }).sort({ createdAt: -1 });
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user pets', error: error.message });
  }
};

// @desc    Get a single pet profile by ID
// @route   GET /api/pets/:petId
// @access  Public
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving pet profile details', error: error.message });
  }
};

// @desc    Add a new pet profile
// @route   POST /api/pets
// @access  Public
exports.addPet = async (req, res) => {
  try {
    const { 
      owner, name, species, breed, age, weight, gender, color, size,
      isVaccinated, vaccinationDate, nextVaccinationDate, medicalHistory, allergies, diseases, bloodGroup,
      friendlyWithKids, friendlyWithPets, trainingLevel, neuteredSpayed, microchipNumber, foodPreference,
      behaviour, personality, aboutPet, adoptionStatus, activeStatus,
      country, province, city, address, image, imageSettings, documents,
      price, negotiable
    } = req.body;

    if (!owner || !name || !breed || !age || !weight || !gender) {
      return res.status(400).json({ message: 'Please provide all required pet properties' });
    }

    const pet = await Pet.create({
      owner,
      name,
      species: species || 'Dog',
      breed,
      age,
      weight,
      gender,
      color: color || '',
      size: size || '',
      isVaccinated: isVaccinated !== undefined ? isVaccinated : false,
      vaccinationDate: vaccinationDate || '',
      nextVaccinationDate: nextVaccinationDate || '',
      medicalHistory: medicalHistory || '',
      allergies: allergies || '',
      diseases: diseases || '',
      bloodGroup: bloodGroup || '',
      friendlyWithKids: friendlyWithKids !== undefined ? friendlyWithKids : false,
      friendlyWithPets: friendlyWithPets !== undefined ? friendlyWithPets : false,
      trainingLevel: trainingLevel || 'None',
      neuteredSpayed: neuteredSpayed !== undefined ? neuteredSpayed : false,
      microchipNumber: microchipNumber || '',
      foodPreference: foodPreference || '',
      behaviour: behaviour || '',
      personality: personality || '',
      aboutPet: aboutPet || '',
      adoptionStatus: adoptionStatus || 'Available',
      activeStatus: activeStatus || 'ACTIVE',
      country: country || 'Pakistan',
      province: province || 'Punjab',
      city: city || 'Lahore',
      address: address || '',
      image: image || '',
      imageSettings: imageSettings || { positionX: 50, positionY: 50, scale: 1, objectPosition: '50% 50%' },
      documents: documents || [],
      price: price !== undefined ? price : 0,
      negotiable: negotiable !== undefined ? negotiable : true,
      vaccines: [],
      medicalRecords: [],
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error creating pet profile', error: error.message });
  }
};

// @desc    Update an existing pet profile
// @route   PUT /api/pets/:petId
// @access  Public
exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }

    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.owner.toString() !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }

    const updates = req.body;
    
    // Update simple attributes dynamically
    const fields = [
      'name', 'species', 'breed', 'age', 'weight', 'gender', 'color', 'size',
      'isVaccinated', 'vaccinationDate', 'nextVaccinationDate', 'medicalHistory', 'allergies', 'diseases', 'bloodGroup',
      'friendlyWithKids', 'friendlyWithPets', 'trainingLevel', 'neuteredSpayed', 'microchipNumber', 'foodPreference',
      'behaviour', 'personality', 'aboutPet', 'adoptionStatus', 'activeStatus',
      'country', 'province', 'city', 'address', 'image', 'imageSettings', 'documents',
      'price', 'negotiable', 'moderationStatus', 'isFeatured', 'viewsCount', 'favoritesCount', 'reportsCount'
    ];

    fields.forEach((field) => {
      if (updates[field] !== undefined) {
        pet[field] = updates[field];
      }
    });

    const updatedPet = await pet.save();
    res.status(200).json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: 'Error updating pet profile', error: error.message });
  }
};

// @desc    Delete a pet profile
// @route   DELETE /api/pets/:petId
// @access  Public
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }

    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.owner.toString() !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }

    await pet.deleteOne();
    res.status(200).json({ message: 'Pet profile successfully deleted', petId: req.params.petId });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pet profile', error: error.message });
  }
};

// @desc    Add a vaccine record to a pet's timeline
// @route   POST /api/pets/:petId/vaccine
// @access  Public
exports.addVaccine = async (req, res) => {
  try {
    const { vaccineName, dose, date, nextDueDate, veterinarian, notes } = req.body;
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }

    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.owner.toString() !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }

    pet.vaccines.push({
      vaccineName,
      dose,
      date,
      nextDueDate,
      veterinarian,
      notes,
    });

    // Mark as vaccinated if not set
    pet.isVaccinated = true;

    await pet.save();
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error logging vaccine entry', error: error.message });
  }
};

// @desc    Add a medical clinic record to a pet's history timeline
// @route   POST /api/pets/:petId/medical-record
// @access  Public
exports.addMedicalRecord = async (req, res) => {
  try {
    const { disease, symptoms, diagnosis, treatment, medicine, doctor, clinic, visitDate, nextVisitDate, attachments } = req.body;
    const pet = await Pet.findById(req.params.petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }

    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.owner.toString() !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }

    pet.medicalRecords.push({
      disease,
      symptoms,
      diagnosis,
      treatment,
      medicine,
      doctor,
      clinic,
      visitDate,
      nextVisitDate,
      attachments: attachments || [],
    });

    await pet.save();
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error logging medical history record', error: error.message });
  }
};
