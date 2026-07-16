const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a pet name'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Please specify species (e.g. Dog, Cat)'],
      default: 'Dog',
      trim: true,
    },
    breed: {
      type: String,
      required: [true, 'Please specify the pet breed'],
      trim: true,
    },
    age: {
      type: String,
      required: [true, 'Please provide the pet age (e.g. 3 yrs)'],
      trim: true,
    },
    weight: {
      type: String,
      required: [true, 'Please specify the pet weight (e.g. 28 kg)'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Please select the pet gender'],
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    color: {
      type: String,
      default: '',
      trim: true,
    },
    size: {
      type: String,
      default: '',
      trim: true,
    },
    isVaccinated: {
      type: Boolean,
      default: false,
    },
    vaccinationDate: {
      type: String,
      default: '',
    },
    nextVaccinationDate: {
      type: String,
      default: '',
    },
    medicalHistory: {
      type: String,
      default: '',
    },
    allergies: {
      type: String,
      default: '',
    },
    diseases: {
      type: String,
      default: '',
    },
    bloodGroup: {
      type: String,
      default: '',
    },
    friendlyWithKids: {
      type: Boolean,
      default: false,
    },
    friendlyWithPets: {
      type: Boolean,
      default: false,
    },
    trainingLevel: {
      type: String,
      enum: ['None', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'None',
    },
    neuteredSpayed: {
      type: Boolean,
      default: false,
    },
    microchipNumber: {
      type: String,
      default: '',
    },
    foodPreference: {
      type: String,
      default: '',
    },
    behaviour: {
      type: String,
      default: '',
    },
    personality: {
      type: String,
      default: '',
    },
    aboutPet: {
      type: String,
      default: '',
    },
    adoptionStatus: {
      type: String,
      enum: ['Available', 'Pending', 'Adopted', 'Not for Adoption'],
      default: 'Available',
    },
    activeStatus: {
      type: String,
      enum: ['ACTIVE', 'FOR_SALE', 'FOR_ADOPTION', 'IN_SHELTER', 'LOST', 'DECEASED', 'ARCHIVED'],
      default: 'ACTIVE',
    },
    country: {
      type: String,
      default: 'Pakistan',
    },
    province: {
      type: String,
      default: 'Punjab',
    },
    city: {
      type: String,
      default: 'Lahore',
    },
    address: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    imageSettings: {
      positionX: { type: Number, default: 50 },
      positionY: { type: Number, default: 50 },
      scale: { type: Number, default: 1 },
      objectPosition: { type: String, default: '50% 50%' }
    },
    documents: [
      {
        name: String,
        fileType: String,
        data: String, // Base64 content
      }
    ],
    vaccines: [
      {
        vaccineName: String,
        dose: String,
        date: String,
        nextDueDate: String,
        veterinarian: String,
        notes: String,
      }
    ],
    medicalRecords: [
      {
        disease: String,
        symptoms: String,
        diagnosis: String,
        treatment: String,
        medicine: String,
        doctor: String,
        clinic: String,
        visitDate: String,
        nextVisitDate: String,
        attachments: [String], // Array of Base64 attachments
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pet', petSchema);
