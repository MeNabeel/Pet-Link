const { prisma } = require('../../database/supabase/client');

const mapPet = (pet) => {
  if (!pet) return null;
  const mapped = {
    ...pet,
    _id: pet.id,
    owner: pet.ownerId
  };
  delete mapped.id;
  delete mapped.ownerId;
  return mapped;
};

// @desc    Get all pets belonging to a specific owner
// @route   GET /api/pets/owner/:ownerId
// @access  Public
exports.getPetsByOwner = async (req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      where: {
        ownerId: req.params.ownerId,
        activeStatus: { not: 'ARCHIVED' }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(pets.map(mapPet));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user pets', error: error.message });
  }
};

// @desc    Get a single pet profile by ID
// @route   GET /api/pets/:petId
// @access  Public
exports.getPetById = async (req, res) => {
  try {
    const pet = await prisma.pet.findUnique({
      where: { id: req.params.petId }
    });
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }
    res.status(200).json(mapPet(pet));
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

    const pet = await prisma.pet.create({
      data: {
        ownerId: owner,
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
        price: price !== undefined ? parseFloat(price) : 0,
        negotiable: negotiable !== undefined ? negotiable : true,
        vaccines: [],
        medicalRecords: [],
      }
    });

    res.status(201).json(mapPet(pet));
  } catch (error) {
    res.status(500).json({ message: 'Error creating pet profile', error: error.message });
  }
};

// @desc    Update an existing pet profile
// @route   PUT /api/pets/:petId
// @access  Public
exports.updatePet = async (req, res) => {
  try {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.petId } });
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }

    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.ownerId !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }

    const updates = req.body;
    const data = {};

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
        if (field === 'price') {
          data[field] = parseFloat(updates[field]);
        } else if (field === 'viewsCount' || field === 'favoritesCount' || field === 'reportsCount') {
          data[field] = parseInt(updates[field], 10);
        } else {
          data[field] = updates[field];
        }
      }
    });

    const updatedPet = await prisma.pet.update({
      where: { id: req.params.petId },
      data
    });

    res.status(200).json(mapPet(updatedPet));
  } catch (error) {
    res.status(500).json({ message: 'Error updating pet profile', error: error.message });
  }
};

// @desc    Delete a pet profile
// @route   DELETE /api/pets/:petId
// @access  Public
exports.deletePet = async (req, res) => {
  try {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.petId } });
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }

    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.ownerId !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }

    await prisma.pet.delete({ where: { id: req.params.petId } });
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
    const { ...vaccine } = req.body;
    const pet = await prisma.pet.findUnique({ where: { id: req.params.petId } });
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }

    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.ownerId !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }

    const vaccinesList = Array.isArray(pet.vaccines) ? pet.vaccines : [];
    vaccinesList.push(vaccine);

    const updated = await prisma.pet.update({
      where: { id: req.params.petId },
      data: {
        vaccines: vaccinesList,
        isVaccinated: true
      }
    });

    res.status(200).json(mapPet(updated));
  } catch (error) {
    res.status(500).json({ message: 'Error logging vaccine entry', error: error.message });
  }
};

// @desc    Add a medical clinic record to a pet's history timeline
// @route   POST /api/pets/:petId/medical-record
// @access  Public
exports.addMedicalRecord = async (req, res) => {
  try {
    const { ...record } = req.body;
    const pet = await prisma.pet.findUnique({ where: { id: req.params.petId } });
    if (!pet) {
      return res.status(404).json({ message: 'Pet profile not found' });
    }

    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.ownerId !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }

    const recordsList = Array.isArray(pet.medicalRecords) ? pet.medicalRecords : [];
    recordsList.push(record);

    const updated = await prisma.pet.update({
      where: { id: req.params.petId },
      data: {
        medicalRecords: recordsList
      }
    });

    res.status(200).json(mapPet(updated));
  } catch (error) {
    res.status(500).json({ message: 'Error logging medical history record', error: error.message });
  }
};
