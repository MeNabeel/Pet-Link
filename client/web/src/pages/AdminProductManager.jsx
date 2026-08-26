import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Copy, Archive, Eye, CheckCircle, 
  ChevronUp, ChevronDown, RefreshCw, Layers, ArrowLeft, Image as ImageIcon,
  AlertTriangle, DollarSign, Package, Check, X, Sparkles, Shirt, Cookie,
  ToyBrick, Bed, Scissors, Pill, HeartPulse, Activity, Briefcase, PackageOpen,
  Loader2, Apple, ClipboardList, Truck, Warehouse, Boxes, ShieldCheck, Globe
} from 'lucide-react';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/Skeleton';
import './AdminProductManager.css';

const PRODUCT_TYPES = [
  { id: 'Food', label: 'Food', desc: 'Kibbles, wet meals, raw options', icon: BoneIcon },
  { id: 'Treats', label: 'Treats', desc: 'Chews, biscuits, dried meats', icon: Cookie },
  { id: 'Supplements', label: 'Supplements', desc: 'Vitamins, hip & joint oil', icon: HeartPulse },
  { id: 'Medicine', label: 'Medicine', desc: 'Dewormers, flea treatment', icon: Pill },
  { id: 'Accessories', label: 'Accessories', desc: 'Bowls, tags, feeders', icon: Sparkles },
  { id: 'Clothing', label: 'Clothing', desc: 'Sweaters, jackets, boots', icon: Shirt },
  { id: 'Toys', label: 'Toys', desc: 'Balls, ropes, interactive puzzles', icon: ToyBrick },
  { id: 'Grooming', label: 'Grooming', desc: 'Shampoo, nail cutters, brushes', icon: Scissors },
  { id: 'Beds', label: 'Beds', desc: 'Mattresses, cushions, caves', icon: Bed },
  { id: 'Carrier', label: 'Carrier', desc: 'Bags, travel crates, car seats', icon: Briefcase },
  { id: 'Leash & Collar', label: 'Leash & Collar', desc: 'Harnesses, leads, tags', icon: Activity },
  { id: 'Cage', label: 'Cage', desc: 'Cages, enclosures, pens', icon: Package },
  { id: 'Aquarium', label: 'Aquarium', desc: 'Tanks, filters, decorations', icon: WavesIcon },
  { id: 'Litter', label: 'Litter', desc: 'Litter box, sand, scoops', icon: Layers },
  { id: 'Other', label: 'Other', desc: 'Unclassified catalog items', icon: PackageOpen }
];

// Fallback Dog/Bone icon in case bone doesn't exist
function BoneIcon(props) {
  return <Cookie {...props} style={{ transform: 'rotate(-45deg)', ...props.style }} />;
}

function WavesIcon(props) {
  return <Activity {...props} style={{ transform: 'rotate(90deg)', ...props.style }} />;
}

export default function AdminProductManager({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [savingStatus, setSavingStatus] = useState(null); // 'Saving' | 'Publishing' | null

  // Sort states
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View state: 'list' | 'add' | 'edit' | 'detail'
  const [view, setView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);

  // New custom dynamic specs attributes
  const [specKeyInput, setSpecKeyInput] = useState('');
  const [specValInput, setSpecValInput] = useState('');

  // Variants editing helpers
  const [variantColor, setVariantColor] = useState('');
  const [variantSize, setVariantSize] = useState('');
  const [variantFlavor, setVariantFlavor] = useState('');
  const [variantWeight, setVariantWeight] = useState('');
  const [variantMaterial, setVariantMaterial] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [variantStock, setVariantStock] = useState('');
  const [variantSku, setVariantSku] = useState('');

  // Form inputs state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    images: [],
    brand: '',
    sku: '',
    barcode: '',
    description: '',
    shortDescription: '',
    regularPrice: '',
    salePrice: '',
    discount: 0,
    stockQuantity: '',
    stockStatus: 'In Stock',
    weight: '',
    dimensions: '',
    petType: 'Dog',
    ageGroup: 'Adult',
    tags: '',
    sizes: [],
    gender: 'Unisex',
    visibility: 'Public',
    featured: false,
    recommended: false,
    status: 'Published',
    // Dynamic Product Types Specs
    productType: 'Other',
    clothingSpecs: {
      sizeChart: '',
      neckSize: '',
      chestSize: '',
      bodyLength: '',
      material: '',
      fabric: '',
      waterproof: false,
      stretchable: false,
      winter: false,
      summer: false,
      machineWash: false,
      handWash: false,
      adjustableStraps: false,
      reflective: false
    },
    toySpecs: {
      toyCategory: '',
      interactive: false,
      chewResistant: 'Medium',
      rope: false,
      plush: false,
      rubber: false,
      latexFree: false,
      squeaky: false,
      puzzleLevel: '1',
      recommendedAge: '',
      indoorOutdoor: 'Both',
      safetyCert: ''
    },
    foodSpecs: {
      foodType: 'Dry',
      flavor: '',
      weightOptions: '',
      proteinPercent: '',
      fatPercent: '',
      fiberPercent: '',
      moisturePercent: '',
      calories: '',
      ingredients: '',
      nutritionalFacts: '',
      feedingGuide: '',
      storageInstructions: '',
      manufactureDate: '',
      expiryDate: '',
      shelfLife: '',
      breedRecommendation: '',
      allergens: '',
      grainFree: false,
      organic: false,
      vetRecommended: false
    },
    supplementSpecs: {
      supplementType: '',
      vitamins: '',
      minerals: '',
      dosage: '',
      dailyServing: '',
      suitableAge: '',
      weightRecommendation: '',
      healthBenefits: '',
      ingredients: '',
      warnings: '',
      storage: '',
      expiry: '',
      prescriptionRequired: false
    },
    medicineSpecs: {
      prescriptionRequired: false,
      activeIngredient: '',
      dosage: '',
      usageInstructions: '',
      sideEffects: '',
      warnings: '',
      storage: '',
      batchNumber: '',
      manufactureDate: '',
      expiryDate: '',
      veterinaryApproval: ''
    },
    groomingSpecs: {
      shampoo: false,
      soap: false,
      brush: false,
      nailCutter: false,
      perfume: false,
      conditioner: false,
      coatType: '',
      skinType: '',
      sensitiveSkin: false,
      organic: false,
      fragrance: ''
    },
    costPrice: '',
    compareAtPrice: '',
    profitMargin: 0,
    tax: 0,
    shippingCost: 0,
    saleStartDate: '',
    saleEndDate: '',
    trackInventory: true,
    lowStockAlert: 5,
    warehouse: '',
    supplier: '',
    allowBackorder: false,
    reservedStock: 0,
    restockDate: '',
    length: '',
    width: '',
    height: '',
    shippingClass: '',
    fragile: false,
    freeShipping: false,
    cashOnDelivery: true,
    seoTitle: '',
    metaDescription: '',
    seoKeywords: '',
    ogImage: '',
    gtin: '',
    vendor: '',
    countryOfOrigin: 'Pakistan',
    warranty: '',
    internalNotes: '',
    searchKeywords: '',
    breedCompat: [],
    ageCompat: [],
    weightCompat: 'M',
    genderCompat: 'Unisex',
    variants: [],
    frequentlyBoughtTogether: '',
    relatedProducts: '',
    crossSell: '',
    upsell: '',
    enableReviews: true,
    enableRatings: true,
    verifiedPurchaseOnly: true,
    specifications: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await fetch(`${API_URL}/api/categories`, {
        headers: { 'x-requester-id': user._id }
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.filter(c => c.status === 'Active'));
      }

      const prodRes = await fetch(`${API_URL}/api/products`, {
        headers: { 'x-requester-id': user._id }
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTextChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Deep nested state updates for dynamic product type specs
  const handleNestedSpecChange = (specGroup, field, val, type = 'text') => {
    setFormData(prev => ({
      ...prev,
      [specGroup]: {
        ...prev[specGroup],
        [field]: type === 'checkbox' ? !!val : val
      }
    }));
  };

  // Auto calculate profit margin and discount percent
  useEffect(() => {
    const reg = parseFloat(formData.regularPrice);
    const sale = parseFloat(formData.salePrice);
    const cost = parseFloat(formData.costPrice);

    let margin = 0;
    if (reg > 0 && cost > 0) {
      margin = Math.round(((reg - cost) / reg) * 100);
    }

    let disc = 0;
    if (reg > 0 && sale > 0 && sale < reg) {
      disc = Math.round(((reg - sale) / reg) * 100);
    }

    setFormData(prev => ({
      ...prev,
      discount: disc,
      profitMargin: margin
    }));
  }, [formData.regularPrice, formData.salePrice, formData.costPrice]);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddNewClick = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      category: '',
      images: [],
      brand: '',
      sku: `PL-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: '',
      description: '',
      shortDescription: '',
      regularPrice: '',
      salePrice: '',
      discount: 0,
      stockQuantity: '10',
      stockStatus: 'In Stock',
      weight: '',
      dimensions: '',
      petType: 'Dog',
      ageGroup: 'Adult',
      tags: '',
      sizes: [],
      gender: 'Unisex',
      visibility: 'Public',
      featured: false,
      recommended: false,
      status: 'Published',
      productType: 'Other',
      clothingSpecs: {
        sizeChart: '',
        neckSize: '',
        chestSize: '',
        bodyLength: '',
        material: '',
        fabric: '',
        waterproof: false,
        stretchable: false,
        winter: false,
        summer: false,
        machineWash: false,
        handWash: false,
        adjustableStraps: false,
        reflective: false
      },
      toySpecs: {
        toyCategory: '',
        interactive: false,
        chewResistant: 'Medium',
        rope: false,
        plush: false,
        rubber: false,
        latexFree: false,
        squeaky: false,
        puzzleLevel: '1',
        recommendedAge: '',
        indoorOutdoor: 'Both',
        safetyCert: ''
      },
      foodSpecs: {
        foodType: 'Dry',
        flavor: '',
        weightOptions: '',
        proteinPercent: '',
        fatPercent: '',
        fiberPercent: '',
        moisturePercent: '',
        calories: '',
        ingredients: '',
        nutritionalFacts: '',
        feedingGuide: '',
        storageInstructions: '',
        manufactureDate: '',
        expiryDate: '',
        shelfLife: '',
        breedRecommendation: '',
        allergens: '',
        grainFree: false,
        organic: false,
        vetRecommended: false
      },
      supplementSpecs: {
        supplementType: '',
        vitamins: '',
        minerals: '',
        dosage: '',
        dailyServing: '',
        suitableAge: '',
        weightRecommendation: '',
        healthBenefits: '',
        ingredients: '',
        warnings: '',
        storage: '',
        expiry: '',
        prescriptionRequired: false
      },
      medicineSpecs: {
        prescriptionRequired: false,
        activeIngredient: '',
        dosage: '',
        usageInstructions: '',
        sideEffects: '',
        warnings: '',
        storage: '',
        batchNumber: '',
        manufactureDate: '',
        expiryDate: '',
        veterinaryApproval: ''
      },
      groomingSpecs: {
        shampoo: false,
        soap: false,
        brush: false,
        nailCutter: false,
        perfume: false,
        conditioner: false,
        coatType: '',
        skinType: '',
        sensitiveSkin: false,
        organic: false,
        fragrance: ''
      },
      costPrice: '',
      compareAtPrice: '',
      profitMargin: 0,
      tax: 0,
      shippingCost: 0,
      saleStartDate: '',
      saleEndDate: '',
      trackInventory: true,
      lowStockAlert: 5,
      warehouse: '',
      supplier: '',
      allowBackorder: false,
      reservedStock: 0,
      restockDate: '',
      length: '',
      width: '',
      height: '',
      shippingClass: '',
      fragile: false,
      freeShipping: false,
      cashOnDelivery: true,
      seoTitle: '',
      metaDescription: '',
      seoKeywords: '',
      ogImage: '',
      gtin: '',
      vendor: '',
      countryOfOrigin: 'Pakistan',
      warranty: '',
      internalNotes: '',
      searchKeywords: '',
      breedCompat: [],
      ageCompat: [],
      weightCompat: 'M',
      genderCompat: 'Unisex',
      variants: [],
      frequentlyBoughtTogether: '',
      relatedProducts: '',
      crossSell: '',
      upsell: '',
      enableReviews: true,
      enableRatings: true,
      verifiedPurchaseOnly: true,
      specifications: []
    });
    setView('add');
  };

  const handleEditClick = (prod) => {
    setSelectedProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category?._id || '',
      images: prod.images || [],
      brand: prod.brand || '',
      sku: prod.sku,
      barcode: prod.barcode || '',
      description: prod.description || '',
      shortDescription: prod.shortDescription || '',
      regularPrice: prod.regularPrice.toString(),
      salePrice: prod.salePrice ? prod.salePrice.toString() : '',
      discount: prod.discount || 0,
      stockQuantity: prod.stockQuantity.toString(),
      stockStatus: prod.stockStatus || 'In Stock',
      weight: prod.weight || '',
      dimensions: prod.dimensions || '',
      petType: prod.petType || 'Dog',
      ageGroup: prod.ageGroup || 'Adult',
      tags: prod.tags ? (Array.isArray(prod.tags) ? prod.tags.join(', ') : prod.tags) : '',
      sizes: prod.sizes || [],
      gender: prod.gender || 'Unisex',
      visibility: prod.visibility || 'Public',
      featured: !!prod.featured,
      recommended: !!prod.recommended,
      status: prod.status || 'Published',
      productType: prod.productType || 'Other',
      clothingSpecs: prod.clothingSpecs || {},
      toySpecs: prod.toySpecs || {},
      foodSpecs: prod.foodSpecs || {},
      supplementSpecs: prod.supplementSpecs || {},
      medicineSpecs: prod.medicineSpecs || {},
      groomingSpecs: prod.groomingSpecs || {},
      costPrice: prod.costPrice ? prod.costPrice.toString() : '',
      compareAtPrice: prod.compareAtPrice ? prod.compareAtPrice.toString() : '',
      profitMargin: prod.profitMargin || 0,
      tax: prod.tax || 0,
      shippingCost: prod.shippingCost || 0,
      saleStartDate: prod.saleStartDate ? prod.saleStartDate.substring(0, 10) : '',
      saleEndDate: prod.saleEndDate ? prod.saleEndDate.substring(0, 10) : '',
      trackInventory: prod.trackInventory !== undefined ? !!prod.trackInventory : true,
      lowStockAlert: prod.lowStockAlert || 5,
      warehouse: prod.warehouse || '',
      supplier: prod.supplier || '',
      allowBackorder: !!prod.allowBackorder,
      reservedStock: prod.reservedStock || 0,
      restockDate: prod.restockDate ? prod.restockDate.substring(0, 10) : '',
      length: prod.length ? prod.length.toString() : '',
      width: prod.width ? prod.width.toString() : '',
      height: prod.height ? prod.height.toString() : '',
      shippingClass: prod.shippingClass || '',
      fragile: !!prod.fragile,
      freeShipping: !!prod.freeShipping,
      cashOnDelivery: prod.cashOnDelivery !== undefined ? !!prod.cashOnDelivery : true,
      seoTitle: prod.seoTitle || '',
      metaDescription: prod.metaDescription || '',
      seoKeywords: prod.seoKeywords ? (Array.isArray(prod.seoKeywords) ? prod.seoKeywords.join(', ') : prod.seoKeywords) : '',
      ogImage: prod.ogImage || '',
      gtin: prod.gtin || '',
      vendor: prod.vendor || '',
      countryOfOrigin: prod.countryOfOrigin || 'Pakistan',
      warranty: prod.warranty || '',
      internalNotes: prod.internalNotes || '',
      searchKeywords: prod.searchKeywords ? (Array.isArray(prod.searchKeywords) ? prod.searchKeywords.join(', ') : prod.searchKeywords) : '',
      breedCompat: prod.breedCompat || [],
      ageCompat: prod.ageCompat || [],
      weightCompat: prod.weightCompat || 'M',
      genderCompat: prod.genderCompat || 'Unisex',
      variants: prod.variants || [],
      frequentlyBoughtTogether: prod.frequentlyBoughtTogether || '',
      relatedProducts: prod.relatedProducts || '',
      crossSell: prod.crossSell || '',
      upsell: prod.upsell || '',
      enableReviews: prod.enableReviews !== undefined ? !!prod.enableReviews : true,
      enableRatings: prod.enableRatings !== undefined ? !!prod.enableRatings : true,
      verifiedPurchaseOnly: prod.verifiedPurchaseOnly !== undefined ? !!prod.verifiedPurchaseOnly : true,
      specifications: prod.specifications || []
    });
    setView('edit');
  };

  const handleSave = async (e, customStatus = null) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.category || !formData.sku || !formData.regularPrice) {
      alert('Please fill out all required fields');
      return;
    }

    setSavingStatus(customStatus === 'Draft' ? 'Saving' : 'Publishing');

    const payload = {
      ...formData,
      regularPrice: parseFloat(formData.regularPrice) || 0,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : 0,
      profitMargin: formData.profitMargin ? parseFloat(formData.profitMargin) : 0,
      tax: formData.tax ? parseFloat(formData.tax) : 0,
      shippingCost: formData.shippingCost ? parseFloat(formData.shippingCost) : 0,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      lowStockAlert: parseInt(formData.lowStockAlert) || 5,
      reservedStock: parseInt(formData.reservedStock) || 0,
      length: parseFloat(formData.length) || 0,
      width: parseFloat(formData.width) || 0,
      height: parseFloat(formData.height) || 0,
      tags: formData.tags ? (Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(t => t.trim()).filter(Boolean)) : [],
      searchKeywords: formData.searchKeywords ? (Array.isArray(formData.searchKeywords) ? formData.searchKeywords : formData.searchKeywords.split(',').map(t => t.trim()).filter(Boolean)) : [],
      seoKeywords: formData.seoKeywords ? (Array.isArray(formData.seoKeywords) ? formData.seoKeywords : formData.seoKeywords.split(',').map(t => t.trim()).filter(Boolean)) : [],
    };

    if (customStatus) {
      payload.status = customStatus;
    }

    try {
      const url = view === 'edit'
        ? `${API_URL}/api/products/${selectedProduct._id}`
        : `${API_URL}/api/products`;
      const method = view === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setView('list');
        fetchData();
      } else {
        const errData = await response.json();
        alert(errData.message || 'Error occurred while saving product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingStatus(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'x-requester-id': user._id
        }
      });
      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: 'Delete Product Listing',
      description: 'Are you sure you want to permanently delete this product? This action is irreversible.',
      isDanger: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: {
              'x-requester-id': user._id
            }
          });
          if (response.ok) {
            fetchData();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Dynamic specifications actions
  const addSpecification = () => {
    if (!specKeyInput || !specValInput) return;
    setFormData(prev => ({
      ...prev,
      specifications: [...(prev.specifications || []), { key: specKeyInput.trim(), value: specValInput.trim() }]
    }));
    setSpecKeyInput('');
    setSpecValInput('');
  };

  const removeSpecification = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  // Variant manager actions
  const addVariant = () => {
    if (!variantSku || !variantPrice || !variantStock) {
      alert('Please fill out variant SKU, Price, and Stock fields');
      return;
    }
    const newVar = {
      sku: variantSku.trim(),
      price: parseFloat(variantPrice) || 0,
      stock: parseInt(variantStock) || 0,
      color: variantColor.trim() || undefined,
      size: variantSize.trim() || undefined,
      flavor: variantFlavor.trim() || undefined,
      weight: variantWeight.trim() || undefined,
      material: variantMaterial.trim() || undefined,
      image: formData.images[0] || ''
    };

    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVar]
    }));

    setVariantColor('');
    setVariantSize('');
    setVariantFlavor('');
    setVariantWeight('');
    setVariantMaterial('');
    setVariantPrice('');
    setVariantStock('');
    setVariantSku(`VAR-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const removeVariant = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  // Mock AI Generator tools
  const triggerAIGenerator = (type) => {
    alert(`AI processing: generating standard dynamic metadata for ${type}... Mapped via PetLink Copilot SDK.`);
  };

  const toggleSize = (size) => {
    setFormData(prev => {
      const current = prev.sizes || [];
      if (current.includes(size)) {
        return { ...prev, sizes: current.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...current, size] };
      }
    });
  };

  const selectGender = (genderVal) => {
    setFormData(prev => ({ ...prev, gender: prev.gender === genderVal ? '' : genderVal }));
  };

  // Breed Multi-Select check handles
  const toggleBreed = (breed) => {
    setFormData(prev => {
      const current = prev.breedCompat || [];
      if (current.includes(breed)) {
        return { ...prev, breedCompat: current.filter(b => b !== breed) };
      } else {
        return { ...prev, breedCompat: [...current, breed] };
      }
    });
  };

  // Age compatibility multi check handles
  const toggleAgeCompat = (age) => {
    setFormData(prev => {
      const current = prev.ageCompat || [];
      if (current.includes(age)) {
        return { ...prev, ageCompat: current.filter(a => a !== age) };
      } else {
        return { ...prev, ageCompat: [...current, age] };
      }
    });
  };

  // Calculate percentage of details filled out
  const calculateProgress = () => {
    let score = 0;
    if (formData.name) score += 15;
    if (formData.category) score += 15;
    if (formData.regularPrice) score += 15;
    if (formData.sku) score += 15;
    if (formData.description) score += 10;
    if (formData.images && formData.images.length > 0) score += 15;
    if (formData.stockQuantity) score += 10;
    if (formData.gender || (formData.sizes && formData.sizes.length > 0)) score += 5;
    return score;
  };

  // Bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedProducts.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const executeBulkAction = (action, value = null) => {
    const description = action === 'delete' 
      ? `Are you sure you want to permanently delete these ${selectedIds.length} products?`
      : `Are you sure you want to update status to ${value} for these ${selectedIds.length} products?`;

    setConfirmConfig({
      title: 'Bulk Action Confirmation',
      description,
      isDanger: action === 'delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/api/products/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-requester-id': user._id
            },
            body: JSON.stringify({ ids: selectedIds, action, value })
          });
          if (response.ok) {
            setSelectedIds([]);
            fetchData();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                            (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
                            p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === 'all' || (p.category && p.category._id === categoryFilter);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'category') {
        aVal = a.category?.name || '';
        bVal = b.category?.name || '';
      }
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  const paginatedProducts = processedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Modern Skeleton Loading List Layout
  if (loading) {
    return (
      <div className="prod-manager-container fade-in">
        <div className="cat-header-section">
          <div>
            <Skeleton width="220px" height="28px" style={{ marginBottom: '8px' }} />
            <Skeleton width="380px" height="16px" />
          </div>
          <Skeleton width="130px" height="40px" style={{ borderRadius: '12px' }} />
        </div>
        <div className="cat-filter-row" style={{ marginTop: '20px' }}>
          <Skeleton width="280px" height="40px" style={{ borderRadius: '24px' }} />
          <div className="filters-right">
            <Skeleton width="180px" height="40px" style={{ borderRadius: '12px' }} />
            <Skeleton width="150px" height="40px" style={{ borderRadius: '12px' }} />
            <Skeleton width="40px" height="40px" style={{ borderRadius: '10px' }} />
          </div>
        </div>
        <div className="admin-table-wrapper" style={{ marginTop: '20px' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><Skeleton width="18px" height="18px" /></th>
                <th><Skeleton width="60px" height="14px" /></th>
                <th><Skeleton width="120px" height="14px" /></th>
                <th><Skeleton width="80px" height="14px" /></th>
                <th><Skeleton width="80px" height="14px" /></th>
                <th><Skeleton width="70px" height="14px" /></th>
                <th><Skeleton width="60px" height="14px" /></th>
                <th><Skeleton width="70px" height="14px" /></th>
                <th><Skeleton width="90px" height="14px" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td><Skeleton width="18px" height="18px" /></td>
                  <td><Skeleton width="40px" height="40px" style={{ borderRadius: '10px' }} /></td>
                  <td>
                    <Skeleton width="160px" height="14px" style={{ marginBottom: '6px' }} />
                    <Skeleton width="90px" height="11px" />
                  </td>
                  <td><Skeleton width="90px" height="14px" /></td>
                  <td><Skeleton width="70px" height="14px" /></td>
                  <td><Skeleton width="80px" height="14px" /></td>
                  <td><Skeleton width="50px" height="18px" style={{ borderRadius: '6px' }} /></td>
                  <td><Skeleton width="60px" height="18px" style={{ borderRadius: '9999px' }} /></td>
                  <td><Skeleton width="80px" height="14px" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // REDESIGNED Add/Edit Form View (Shopify/Amazon Seller Style)
  if (view === 'add' || view === 'edit') {
    const progressPercent = calculateProgress();

    return (
      <div className="prod-form-workspace fade-in">
        {/* Top Header Row with Actions & Progressive completion Bar */}
        <div className="form-back-header">
          <div className="header-left-side">
            <button type="button" className="back-btn" onClick={() => setView('list')}>
              <ArrowLeft size={16} /> Back
            </button>
            <h2>{view === 'add' ? 'Add New Product Listing' : `Modify: ${formData.name}`}</h2>
          </div>

          <div className="form-progress-wrapper">
            <div className="progress-labels-row">
              <span>Progressive Details completion</span>
              <span className="progress-percent-indicator">{progressPercent}% Done</span>
            </div>
            <div className="progress-track-bg">
              <div className="progress-track-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="header-action-buttons">
            <button 
              type="button" 
              className="pet-btn-outline" 
              onClick={() => handleSave(null, 'Draft')}
              disabled={savingStatus !== null}
              style={{ padding: '10px 18px', borderRadius: '12px' }}
            >
              {savingStatus === 'Saving' ? (
                <>
                  <Loader2 className="animate-spin" size={14} style={{ marginRight: '6px' }} /> Saving...
                </>
              ) : 'Save Draft'}
            </button>
            <button 
              type="button" 
              className="pet-btn-primary" 
              onClick={(e) => handleSave(e)}
              disabled={savingStatus !== null}
              style={{ padding: '10px 20px', borderRadius: '12px' }}
            >
              {savingStatus === 'Publishing' ? (
                <>
                  <Loader2 className="animate-spin" size={14} style={{ marginRight: '6px' }} /> Publishing...
                </>
              ) : (
                <>
                  <Check size={16} style={{ marginRight: '6px' }} /> Add Product
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1. Smart Product Type Selector */}
        <div className="type-selector-wrapper" style={{ marginBottom: '24px' }}>
          <h3 className="section-subtitle-label" style={{ marginBottom: '12px' }}>Smart Catalog Product Type Selector</h3>
          <div className="type-cards-row">
            {PRODUCT_TYPES.map(type => {
              const IconComp = type.icon;
              const isSelected = formData.productType === type.id;
              return (
                <div 
                  key={type.id} 
                  className={`type-option-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, productType: type.id }))}
                >
                  <div className="type-icon-circle">
                    <IconComp size={20} />
                  </div>
                  <h4 className="type-title">{type.label}</h4>
                  <p className="type-desc">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={(e) => handleSave(e)} className="product-form-layout">
          {/* Left Column (65% width) */}
          <div className="form-left-col">
            
            {/* Card 1: General Information */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Setup product name, brand, barcode indexes, and short & detailed descriptive copy sheets.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Product Title / Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleTextChange} 
                    required 
                    placeholder="e.g. Grain-Free Adult Salmon Kibbles" 
                  />
                </div>

                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Short Description (Teaser)</label>
                  <input 
                    type="text" 
                    name="shortDescription" 
                    value={formData.shortDescription} 
                    onChange={handleTextChange} 
                    placeholder="Brief summary matching search catalog index teasers..." 
                  />
                </div>

                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Description Product</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleTextChange} 
                    placeholder="Detailed list of nutrition values, ingredients, instructions, and features..." 
                    rows={5}
                  />
                </div>

                <div className="form-group-row" style={{ marginBottom: '20px' }}>
                  <div className="form-group-field">
                    <label>Barcode (EAN/UPC)</label>
                    <input 
                      type="text" 
                      name="barcode" 
                      value={formData.barcode} 
                      onChange={handleTextChange} 
                      placeholder="e.g. 690123456789" 
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Global Trade Item Number (GTIN)</label>
                    <input 
                      type="text" 
                      name="gtin" 
                      value={formData.gtin} 
                      onChange={handleTextChange} 
                      placeholder="e.g. GTIN-14 code" 
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group-field">
                    <label>Manufacturer Brand *</label>
                    <input 
                      type="text" 
                      name="brand" 
                      value={formData.brand} 
                      onChange={handleTextChange} 
                      required
                      placeholder="e.g. Royal Canin" 
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Product Tags (Comma Separated)</label>
                    <input 
                      type="text" 
                      name="tags" 
                      value={formData.tags} 
                      onChange={handleTextChange} 
                      placeholder="e.g. fresh, grainfree, digestible" 
                    />
                  </div>
                </div>

                <div className="form-group-row" style={{ marginTop: '20px' }}>
                  <div className="form-group-field">
                    <label>Search Keywords (Comma Separated)</label>
                    <input 
                      type="text" 
                      name="searchKeywords" 
                      value={formData.searchKeywords} 
                      onChange={handleTextChange} 
                      placeholder="e.g. healthy, dog food, organic salmon" 
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Internal Administrator Notes</label>
                    <input 
                      type="text" 
                      name="internalNotes" 
                      value={formData.internalNotes} 
                      onChange={handleTextChange} 
                      placeholder="Private admin comments e.g. supplier restock contact details..." 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DYNAMIC CARD: Rendered conditionally depending on selected productType */}
            {formData.productType === 'Clothing' && (
              <Card className="dynamic-type-card fade-in">
                <CardHeader>
                  <CardTitle><Shirt size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Clothing & Wearable Attributes</CardTitle>
                  <CardDescription>Setup neck sizes, body lengths, stretch capabilities, wash rules, and season matches.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Neck Size (cm)</label>
                      <input 
                        type="text" 
                        value={formData.clothingSpecs.neckSize || ''} 
                        onChange={(e) => handleNestedSpecChange('clothingSpecs', 'neckSize', e.target.value)} 
                        placeholder="e.g. 20-32 cm" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Chest Size (cm)</label>
                      <input 
                        type="text" 
                        value={formData.clothingSpecs.chestSize || ''} 
                        onChange={(e) => handleNestedSpecChange('clothingSpecs', 'chestSize', e.target.value)} 
                        placeholder="e.g. 35-50 cm" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Body Length (cm)</label>
                      <input 
                        type="text" 
                        value={formData.clothingSpecs.bodyLength || ''} 
                        onChange={(e) => handleNestedSpecChange('clothingSpecs', 'bodyLength', e.target.value)} 
                        placeholder="e.g. 30 cm" 
                      />
                    </div>
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Material / Fabric Composition</label>
                      <input 
                        type="text" 
                        value={formData.clothingSpecs.material || ''} 
                        onChange={(e) => handleNestedSpecChange('clothingSpecs', 'material', e.target.value)} 
                        placeholder="e.g. 100% Breathable Cotton" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Size Chart URL or Link</label>
                      <input 
                        type="text" 
                        value={formData.clothingSpecs.sizeChart || ''} 
                        onChange={(e) => handleNestedSpecChange('clothingSpecs', 'sizeChart', e.target.value)} 
                        placeholder="e.g. /charts/clothing-sizes.png" 
                      />
                    </div>
                  </div>

                  <div className="checkbox-fields-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.clothingSpecs.waterproof} 
                        onCheckedChange={(checked) => handleNestedSpecChange('clothingSpecs', 'waterproof', checked, 'checkbox')} 
                      />
                      <span>Waterproof Material</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.clothingSpecs.stretchable} 
                        onCheckedChange={(checked) => handleNestedSpecChange('clothingSpecs', 'stretchable', checked, 'checkbox')} 
                      />
                      <span>Stretchable Fabric</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.clothingSpecs.winter} 
                        onCheckedChange={(checked) => handleNestedSpecChange('clothingSpecs', 'winter', checked, 'checkbox')} 
                      />
                      <span>Winter Season Suitable</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.clothingSpecs.summer} 
                        onCheckedChange={(checked) => handleNestedSpecChange('clothingSpecs', 'summer', checked, 'checkbox')} 
                      />
                      <span>Summer Season Suitable</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.clothingSpecs.machineWash} 
                        onCheckedChange={(checked) => handleNestedSpecChange('clothingSpecs', 'machineWash', checked, 'checkbox')} 
                      />
                      <span>Machine Washable</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.clothingSpecs.handWash} 
                        onCheckedChange={(checked) => handleNestedSpecChange('clothingSpecs', 'handWash', checked, 'checkbox')} 
                      />
                      <span>Hand Wash Only</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.clothingSpecs.reflective} 
                        onCheckedChange={(checked) => handleNestedSpecChange('clothingSpecs', 'reflective', checked, 'checkbox')} 
                      />
                      <span>Reflective Lining</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.clothingSpecs.adjustableStraps} 
                        onCheckedChange={(checked) => handleNestedSpecChange('clothingSpecs', 'adjustableStraps', checked, 'checkbox')} 
                      />
                      <span>Adjustable Straps</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.productType === 'Toys' && (
              <Card className="dynamic-type-card fade-in">
                <CardHeader>
                  <CardTitle><ToyBrick size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Toy Specifications</CardTitle>
                  <CardDescription>Configure chew resistance index levels, materials composition, squeaky and interactive properties.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Toy Category</label>
                      <input 
                        type="text" 
                        value={formData.toySpecs.toyCategory || ''} 
                        onChange={(e) => handleNestedSpecChange('toySpecs', 'toyCategory', e.target.value)} 
                        placeholder="e.g. Chew Toy, Fetch Ball" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Chew Resistance Level</label>
                      <Select 
                        value={formData.toySpecs.chewResistant || 'Medium'} 
                        onValueChange={(val) => handleNestedSpecChange('toySpecs', 'chewResistant', val)}
                      >
                        <SelectTrigger style={{ width: '100%' }}>
                          <SelectValue placeholder="Chew Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soft">Soft (Plush Toys)</SelectItem>
                          <SelectItem value="Medium">Medium (Moderate Chewer)</SelectItem>
                          <SelectItem value="Heavy">Heavy (Tough Rubber)</SelectItem>
                          <SelectItem value="Extreme">Extreme (Indestructible Kevlar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Puzzle Difficulty Tier</label>
                      <input 
                        type="text" 
                        value={formData.toySpecs.puzzleLevel || ''} 
                        onChange={(e) => handleNestedSpecChange('toySpecs', 'puzzleLevel', e.target.value)} 
                        placeholder="e.g. Level 1 (Easy)" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Safety Certification</label>
                      <input 
                        type="text" 
                        value={formData.toySpecs.safetyCert || ''} 
                        onChange={(e) => handleNestedSpecChange('toySpecs', 'safetyCert', e.target.value)} 
                        placeholder="e.g. FDA Non-Toxic Rubber, CE Mark" 
                      />
                    </div>
                  </div>

                  <div className="checkbox-fields-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.toySpecs.interactive} 
                        onCheckedChange={(checked) => handleNestedSpecChange('toySpecs', 'interactive', checked, 'checkbox')} 
                      />
                      <span>Interactive Smart Toy</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.toySpecs.rope} 
                        onCheckedChange={(checked) => handleNestedSpecChange('toySpecs', 'rope', checked, 'checkbox')} 
                      />
                      <span>Contains Braided Rope</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.toySpecs.plush} 
                        onCheckedChange={(checked) => handleNestedSpecChange('toySpecs', 'plush', checked, 'checkbox')} 
                      />
                      <span>Plush Material Padding</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.toySpecs.rubber} 
                        onCheckedChange={(checked) => handleNestedSpecChange('toySpecs', 'rubber', checked, 'checkbox')} 
                      />
                      <span>Heavy Duty Rubber</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.toySpecs.latexFree} 
                        onCheckedChange={(checked) => handleNestedSpecChange('toySpecs', 'latexFree', checked, 'checkbox')} 
                      />
                      <span>Latex-Free Materials</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.toySpecs.squeaky} 
                        onCheckedChange={(checked) => handleNestedSpecChange('toySpecs', 'squeaky', checked, 'checkbox')} 
                      />
                      <span>Built-in Squeaker</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.productType === 'Food' && (
              <Card className="dynamic-type-card fade-in">
                <CardHeader>
                  <CardTitle><Apple size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Food & Nutritional Analytics</CardTitle>
                  <CardDescription>Setup protein ratios, calorie content, ingredients listings, grain-free check status, and expiry schedules.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Food Consistency Type</label>
                      <Select 
                        value={formData.foodSpecs.foodType || 'Dry'} 
                        onValueChange={(val) => handleNestedSpecChange('foodSpecs', 'foodType', val)}
                      >
                        <SelectTrigger style={{ width: '100%' }}>
                          <SelectValue placeholder="Food Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dry">Dry (Kibbles)</SelectItem>
                          <SelectItem value="Wet">Wet (Canned Gravy)</SelectItem>
                          <SelectItem value="Raw">Raw (Fresh Meat)</SelectItem>
                          <SelectItem value="Freeze Dried">Freeze Dried (Dehydrated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="form-group-field">
                      <label>Primary Flavor</label>
                      <input 
                        type="text" 
                        value={formData.foodSpecs.flavor || ''} 
                        onChange={(e) => handleNestedSpecChange('foodSpecs', 'flavor', e.target.value)} 
                        placeholder="e.g. Salmon & Sweet Potato" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Protein Ratio (%)</label>
                      <input 
                        type="text" 
                        value={formData.foodSpecs.proteinPercent || ''} 
                        onChange={(e) => handleNestedSpecChange('foodSpecs', 'proteinPercent', e.target.value)} 
                        placeholder="e.g. 28%" 
                      />
                    </div>
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Fat Ratio (%)</label>
                      <input 
                        type="text" 
                        value={formData.foodSpecs.fatPercent || ''} 
                        onChange={(e) => handleNestedSpecChange('foodSpecs', 'fatPercent', e.target.value)} 
                        placeholder="e.g. 15%" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Calories (kcal/kg)</label>
                      <input 
                        type="text" 
                        value={formData.foodSpecs.calories || ''} 
                        onChange={(e) => handleNestedSpecChange('foodSpecs', 'calories', e.target.value)} 
                        placeholder="e.g. 3700 kcal" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Breed Compatibility Recom.</label>
                      <input 
                        type="text" 
                        value={formData.foodSpecs.breedRecommendation || ''} 
                        onChange={(e) => handleNestedSpecChange('foodSpecs', 'breedRecommendation', e.target.value)} 
                        placeholder="e.g. Large Breeds, Golden Retriever" 
                      />
                    </div>
                  </div>

                  <div className="form-group-field" style={{ marginBottom: '20px' }}>
                    <label>Ingredients List</label>
                    <textarea 
                      value={formData.foodSpecs.ingredients || ''} 
                      onChange={(e) => handleNestedSpecChange('foodSpecs', 'ingredients', e.target.value)} 
                      placeholder="Deboned Salmon, Chicken Meal, Brown Rice, Peas..." 
                      rows={3}
                    />
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Manufacture Date</label>
                      <input 
                        type="date" 
                        value={formData.foodSpecs.manufactureDate ? formData.foodSpecs.manufactureDate.substring(0, 10) : ''} 
                        onChange={(e) => handleNestedSpecChange('foodSpecs', 'manufactureDate', e.target.value)} 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Expiry Date</label>
                      <input 
                        type="date" 
                        value={formData.foodSpecs.expiryDate ? formData.foodSpecs.expiryDate.substring(0, 10) : ''} 
                        onChange={(e) => handleNestedSpecChange('foodSpecs', 'expiryDate', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="checkbox-fields-row" style={{ display: 'flex', gap: '20px' }}>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.foodSpecs.grainFree} 
                        onCheckedChange={(checked) => handleNestedSpecChange('foodSpecs', 'grainFree', checked, 'checkbox')} 
                      />
                      <span>100% Grain-Free</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.foodSpecs.organic} 
                        onCheckedChange={(checked) => handleNestedSpecChange('foodSpecs', 'organic', checked, 'checkbox')} 
                      />
                      <span>Organic Certified</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.foodSpecs.vetRecommended} 
                        onCheckedChange={(checked) => handleNestedSpecChange('foodSpecs', 'vetRecommended', checked, 'checkbox')} 
                      />
                      <span>Veterinary Approved Formula</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.productType === 'Supplements' && (
              <Card className="dynamic-type-card fade-in">
                <CardHeader>
                  <CardTitle><HeartPulse size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Supplement Attributes</CardTitle>
                  <CardDescription>Specify vitamin components, health benefits target, daily servings, and prescription mandates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Supplement Type</label>
                      <input 
                        type="text" 
                        value={formData.supplementSpecs.supplementType || ''} 
                        onChange={(e) => handleNestedSpecChange('supplementSpecs', 'supplementType', e.target.value)} 
                        placeholder="e.g. Multivitamin oil, Joint Powder" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Health Benefit Targets</label>
                      <input 
                        type="text" 
                        value={formData.supplementSpecs.healthBenefits || ''} 
                        onChange={(e) => handleNestedSpecChange('supplementSpecs', 'healthBenefits', e.target.value)} 
                        placeholder="e.g. Hips & Joint Health, Skin Coat Care" 
                      />
                    </div>
                  </div>

                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Daily Recommended Dosage</label>
                      <input 
                        type="text" 
                        value={formData.supplementSpecs.dosage || ''} 
                        onChange={(e) => handleNestedSpecChange('supplementSpecs', 'dosage', e.target.value)} 
                        placeholder="e.g. 1 Pump per 10kg body weight" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Vitamins Included</label>
                      <input 
                        type="text" 
                        value={formData.supplementSpecs.vitamins || ''} 
                        onChange={(e) => handleNestedSpecChange('supplementSpecs', 'vitamins', e.target.value)} 
                        placeholder="e.g. Vitamin A, D3, E, Omega-3" 
                      />
                    </div>
                  </div>

                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.supplementSpecs.prescriptionRequired} 
                      onCheckedChange={(checked) => handleNestedSpecChange('supplementSpecs', 'prescriptionRequired', checked, 'checkbox')} 
                    />
                    <span>Veterinary Prescription Required</span>
                  </label>
                </CardContent>
              </Card>
            )}

            {formData.productType === 'Medicine' && (
              <Card className="dynamic-type-card fade-in">
                <CardHeader>
                  <CardTitle><Pill size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Veterinary Medicine Specifications</CardTitle>
                  <CardDescription>Setup active pharmaceutical ingredients, warning statements, batch numbers, and approvals.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Active Pharmaceutical Ingredients</label>
                      <input 
                        type="text" 
                        value={formData.medicineSpecs.activeIngredient || ''} 
                        onChange={(e) => handleNestedSpecChange('medicineSpecs', 'activeIngredient', e.target.value)} 
                        placeholder="e.g. Ivermectin 1%, Fipronil" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Batch Number Reference</label>
                      <input 
                        type="text" 
                        value={formData.medicineSpecs.batchNumber || ''} 
                        onChange={(e) => handleNestedSpecChange('medicineSpecs', 'batchNumber', e.target.value)} 
                        placeholder="e.g. BATCH-2026-09" 
                      />
                    </div>
                  </div>

                  <div className="form-group-field" style={{ marginBottom: '20px' }}>
                    <label>Usage & Admin Instructions</label>
                    <textarea 
                      value={formData.medicineSpecs.usageInstructions || ''} 
                      onChange={(e) => handleNestedSpecChange('medicineSpecs', 'usageInstructions', e.target.value)} 
                      placeholder="Administer orally once daily after food intake..." 
                      rows={2}
                    />
                  </div>

                  <div className="form-group-field" style={{ marginBottom: '20px' }}>
                    <label>Warnings & Side Effects</label>
                    <textarea 
                      value={formData.medicineSpecs.warnings || ''} 
                      onChange={(e) => handleNestedSpecChange('medicineSpecs', 'warnings', e.target.value)} 
                      placeholder="Do not administer to puppies under 8 weeks. Side effects include mild lethargy..." 
                      rows={2}
                    />
                  </div>

                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.medicineSpecs.prescriptionRequired} 
                      onCheckedChange={(checked) => handleNestedSpecChange('medicineSpecs', 'prescriptionRequired', checked, 'checkbox')} 
                    />
                    <span style={{ fontWeight: '800', color: '#EF4444' }}>Require Veterinary Prescription Verification</span>
                  </label>
                </CardContent>
              </Card>
            )}

            {formData.productType === 'Grooming' && (
              <Card className="dynamic-type-card fade-in">
                <CardHeader>
                  <CardTitle><Scissors size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Grooming Specifications</CardTitle>
                  <CardDescription>Setup coat match suitability index levels, organic checks, and fragrance styles.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="form-group-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group-field">
                      <label>Target Coat Type Suitability</label>
                      <input 
                        type="text" 
                        value={formData.groomingSpecs.coatType || ''} 
                        onChange={(e) => handleNestedSpecChange('groomingSpecs', 'coatType', e.target.value)} 
                        placeholder="e.g. Double Coat, Curly Hair, Short Coat" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Target Skin Type Suitability</label>
                      <input 
                        type="text" 
                        value={formData.groomingSpecs.skinType || ''} 
                        onChange={(e) => handleNestedSpecChange('groomingSpecs', 'skinType', e.target.value)} 
                        placeholder="e.g. Dry skin, flaky coat" 
                      />
                    </div>
                    <div className="form-group-field">
                      <label>Fragrance Description</label>
                      <input 
                        type="text" 
                        value={formData.groomingSpecs.fragrance || ''} 
                        onChange={(e) => handleNestedSpecChange('groomingSpecs', 'fragrance', e.target.value)} 
                        placeholder="e.g. Sweet Chamomile & Lavender" 
                      />
                    </div>
                  </div>

                  <div className="checkbox-fields-row" style={{ display: 'flex', gap: '20px' }}>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.groomingSpecs.shampoo} 
                        onCheckedChange={(checked) => handleNestedSpecChange('groomingSpecs', 'shampoo', checked, 'checkbox')} 
                      />
                      <span>Shampoo</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.groomingSpecs.brush} 
                        onCheckedChange={(checked) => handleNestedSpecChange('groomingSpecs', 'brush', checked, 'checkbox')} 
                      />
                      <span>Shedding Brush</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.groomingSpecs.organic} 
                        onCheckedChange={(checked) => handleNestedSpecChange('groomingSpecs', 'organic', checked, 'checkbox')} 
                      />
                      <span>100% Organic Extracts</span>
                    </label>
                    <label className="checkbox-alignment-wrapper">
                      <Checkbox 
                        checked={!!formData.groomingSpecs.sensitiveSkin} 
                        onCheckedChange={(checked) => handleNestedSpecChange('groomingSpecs', 'sensitiveSkin', checked, 'checkbox')} 
                      />
                      <span>Sensitive Skin Safe</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card 3: Pet Compatibility Targets */}
            <Card>
              <CardHeader>
                <CardTitle><ShieldCheck size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Target Pet Compatibility</CardTitle>
                <CardDescription>Assign compatible breeds, weights limits, genders, and age groups.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Breed Compatibility Selection (Multi-select click to toggle)</label>
                  <div className="sizes-pill-grid">
                    {['German Shepherd', 'Golden Retriever', 'Persian Cat', 'Siamese Cat', 'Pug', 'Labrador', 'Parrot', 'Finch', 'Angelfish', 'Goldfish'].map(brd => {
                      const active = formData.breedCompat && formData.breedCompat.includes(brd);
                      return (
                        <div 
                          key={brd} 
                          className={`size-pill-chip ${active ? 'active' : ''}`}
                          style={{ minWidth: '110px' }}
                          onClick={() => toggleBreed(brd)}
                        >
                          {brd}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group-field">
                    <label>Target Weight Classes</label>
                    <Select 
                      value={formData.weightCompat || 'M'} 
                      onValueChange={(val) => setFormData(prev => ({ ...prev, weightCompat: val }))}
                    >
                      <SelectTrigger style={{ width: '100%' }}>
                        <SelectValue placeholder="Weight Compatibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XS">Extra Small (XS)</SelectItem>
                        <SelectItem value="S">Small (S)</SelectItem>
                        <SelectItem value="M">Medium (M)</SelectItem>
                        <SelectItem value="L">Large (L)</SelectItem>
                        <SelectItem value="XL">Extra Large (XL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="form-group-field">
                    <label>Target Gender Compatibility</label>
                    <Select 
                      value={formData.genderCompat || 'Unisex'} 
                      onValueChange={(val) => setFormData(prev => ({ ...prev, genderCompat: val }))}
                    >
                      <SelectTrigger className={`gender-badge-${(formData.genderCompat || 'Unisex').toLowerCase()}`} style={{ width: '100%' }}>
                        <SelectValue placeholder="Gender Match" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male products</SelectItem>
                        <SelectItem value="Female">Female products</SelectItem>
                        <SelectItem value="Unisex">Unisex (All pets)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="form-group-field" style={{ marginTop: '20px' }}>
                  <label>Compatible Age Target Groups</label>
                  <div className="checkbox-fields-row" style={{ display: 'flex', gap: '20px' }}>
                    {['Puppy', 'Kitten', 'Junior', 'Adult', 'Senior'].map(age => (
                      <label key={age} className="checkbox-alignment-wrapper">
                        <Checkbox 
                          checked={formData.ageCompat && formData.ageCompat.includes(age)} 
                          onCheckedChange={() => toggleAgeCompat(age)} 
                        />
                        <span>{age} Compatibility</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Product Variant Matrix */}
            <Card>
              <CardHeader>
                <CardTitle><Boxes size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Product Variants Matrix</CardTitle>
                <CardDescription>Generate customized catalog choices for color, size, flavor, weight or custom material packages.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Variant inputs form row */}
                <div className="variant-add-sub-box" style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)', marginBottom: '18px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-primary)', display: 'block', marginBottom: '12px' }}>Configure Variant Options</span>
                  <div className="form-group-row" style={{ gap: '10px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Color (e.g. Red)" value={variantColor} onChange={e => setVariantColor(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                    <input type="text" placeholder="Size (e.g. L)" value={variantSize} onChange={e => setVariantSize(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                    <input type="text" placeholder="Flavor (e.g. Tuna)" value={variantFlavor} onChange={e => setVariantFlavor(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                    <input type="text" placeholder="Weight (e.g. 5kg)" value={variantWeight} onChange={e => setVariantWeight(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                  </div>
                  <div className="form-group-row" style={{ gap: '10px', marginBottom: '12px' }}>
                    <input type="text" placeholder="Material (e.g. Nylon)" value={variantMaterial} onChange={e => setVariantMaterial(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                    <input type="text" placeholder="SKU *" value={variantSku} onChange={e => setVariantSku(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                    <input type="number" placeholder="Price *" value={variantPrice} onChange={e => setVariantPrice(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                    <input type="number" placeholder="Stock *" value={variantStock} onChange={e => setVariantStock(e.target.value)} style={{ padding: '8px', fontSize: '12px' }} />
                  </div>
                  <button type="button" className="pet-btn-outline" onClick={addVariant} style={{ width: '100%', padding: '8px', fontSize: '12px', justifyContent: 'center' }}>
                    <Plus size={14} style={{ marginRight: '6px' }} /> Add Variant Option to Table
                  </button>
                </div>

                {/* Variants List Table */}
                {formData.variants && formData.variants.length > 0 ? (
                  <table className="admin-table" style={{ width: '100%', fontSize: '11px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th>Variant specs</th>
                        <th>Price (PKR)</th>
                        <th>Stock Qty</th>
                        <th>SKU Code</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.variants.map((v, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {v.color && <span className="badge-variant">Color: {v.color}</span>}
                              {v.size && <span className="badge-variant">Size: {v.size}</span>}
                              {v.flavor && <span className="badge-variant">Flavor: {v.flavor}</span>}
                              {v.weight && <span className="badge-variant">Weight: {v.weight}</span>}
                              {v.material && <span className="badge-variant">Material: {v.material}</span>}
                            </div>
                          </td>
                          <td><strong>{v.price} PKR</strong></td>
                          <td>{v.stock} items</td>
                          <td><code>{v.sku}</code></td>
                          <td>
                            <button type="button" onClick={() => removeVariant(idx)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '24px', textTransform: 'uppercase', fontSize: '10px', textAlign: 'center', color: 'var(--color-muted)', background: '#F8FAFC', borderRadius: '14px', border: '1px dashed var(--color-border)' }}>
                    No variants added. Standard SKU catalog matching applies.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 5: Extended Pricing & Shipping */}
            <Card>
              <CardHeader>
                <CardTitle><DollarSign size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Extended Pricing & Ship Metrics</CardTitle>
                <CardDescription>Auto profit margin calculations, compare price, weight details and COD visibilities.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="form-group-row" style={{ marginBottom: '20px' }}>
                  <div className="form-group-field">
                    <label>Regular Listing Price *</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-prefix">PKR</span>
                      <input 
                        type="number" 
                        name="regularPrice" 
                        value={formData.regularPrice} 
                        onChange={handleTextChange} 
                        required 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label>Sales Markdowns Price</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-prefix">PKR</span>
                      <input 
                        type="number" 
                        name="salePrice" 
                        value={formData.salePrice} 
                        onChange={handleTextChange} 
                        placeholder="Markdown price" 
                      />
                    </div>
                  </div>

                  <div className="form-group-field">
                    <label>Cost / Wholesale Price</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-prefix">PKR</span>
                      <input 
                        type="number" 
                        name="costPrice" 
                        value={formData.costPrice} 
                        onChange={handleTextChange} 
                        placeholder="Acquisition Cost" 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group-row" style={{ marginBottom: '20px' }}>
                  <div className="form-group-field">
                    <label>Auto-Calculated Margin (%)</label>
                    <input 
                      type="text" 
                      value={`${formData.profitMargin}% Profit Margin`} 
                      disabled 
                      className="disabled-input"
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Compare At Price</label>
                    <div className="currency-input-wrapper">
                      <span className="currency-prefix">PKR</span>
                      <input 
                        type="number" 
                        name="compareAtPrice" 
                        value={formData.compareAtPrice} 
                        onChange={handleTextChange} 
                        placeholder="Compare At price" 
                      />
                    </div>
                  </div>
                  <div className="form-group-field">
                    <label>Tax (%)</label>
                    <input 
                      type="number" 
                      name="tax" 
                      value={formData.tax} 
                      onChange={handleTextChange} 
                      placeholder="GST Tax" 
                    />
                  </div>
                </div>

                <Separator orientation="horizontal" />

                {/* Shipping dimensions */}
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-dark)', margin: '16px 0 8px' }}><Truck size={14} style={{ marginRight: '6px', display: 'inline-block' }} />Shipping & Parcel Dimensions</h4>
                <div className="form-group-row" style={{ marginBottom: '20px' }}>
                  <div className="form-group-field">
                    <label>Weight (kg)</label>
                    <input 
                      type="text" 
                      name="weight" 
                      value={formData.weight} 
                      onChange={handleTextChange} 
                      placeholder="e.g. 1.2 kg" 
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Length (cm)</label>
                    <input 
                      type="number" 
                      name="length" 
                      value={formData.length} 
                      onChange={handleTextChange} 
                      placeholder="Parcel Length" 
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Width (cm)</label>
                    <input 
                      type="number" 
                      name="width" 
                      value={formData.width} 
                      onChange={handleTextChange} 
                      placeholder="Parcel Width" 
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Height (cm)</label>
                    <input 
                      type="number" 
                      name="height" 
                      value={formData.height} 
                      onChange={handleTextChange} 
                      placeholder="Parcel Height" 
                    />
                  </div>
                </div>

                <div className="checkbox-fields-row" style={{ display: 'flex', gap: '20px' }}>
                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.fragile} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fragile: checked }))} 
                    />
                    <span>Mark Fragile Parcel</span>
                  </label>
                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.freeShipping} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, freeShipping: checked }))} 
                    />
                    <span>Free Shipping Included</span>
                  </label>
                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.cashOnDelivery} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cashOnDelivery: checked }))} 
                    />
                    <span>Cash on Delivery (COD)</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (35% width) */}
          <div className="form-right-col">
            
            {/* Card 6: Professional Media Manager */}
            <Card>
              <CardHeader>
                <CardTitle><ImageIcon size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Media Manager</CardTitle>
                <CardDescription>Manage main listing catalogues picture and thumbnails gallery arrays.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="main-upload-preview-card">
                  {formData.images && formData.images.length > 0 ? (
                    <>
                      <img src={formData.images[0]} alt="Main Preview" className="main-preview-img" />
                      <button 
                        type="button" 
                        className="remove-thumb-x" 
                        onClick={() => removeImage(0)}
                        style={{ width: '24px', height: '24px', fontSize: '12px', top: '8px', right: '8px' }}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <label className="empty-uploader-placeholder">
                      <ImageIcon size={32} />
                      <span>Upload Main Product Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData(prev => ({ ...prev, images: [reader.result, ...prev.images] }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  )}
                </div>

                {/* Previews grid row */}
                <div className="thumbnail-uploads-row">
                  {formData.images.slice(1).map((img, idx) => (
                    <div key={idx} className="thumb-preview-item">
                      <img src={img} alt="Thumb Preview" className="thumb-preview-img" />
                      <button 
                        type="button" 
                        className="remove-thumb-x" 
                        onClick={() => removeImage(idx + 1)}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  <label className="add-thumb-dashed-button">
                    <Plus size={20} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImagesChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Card 7: Category Placement & Stock levels */}
            <Card>
              <CardHeader>
                <CardTitle><Warehouse size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Category & Warehouse</CardTitle>
                <CardDescription>Inventory trace warehouse targets, alerts, and visibility states.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Product Placement Category *</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                  >
                    <SelectTrigger style={{ width: '100%', minWidth: '100%' }}>
                      <SelectValue placeholder="Select placement category...">
                        {categories.find(c => c._id === formData.category)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent style={{ width: '100%' }}>
                      {categories.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Unique Catalog SKU *</label>
                  <input 
                    type="text" 
                    name="sku" 
                    value={formData.sku} 
                    onChange={handleTextChange} 
                    required 
                  />
                </div>

                <div className="form-group-row" style={{ marginBottom: '20px' }}>
                  <div className="form-group-field">
                    <label>Stock Qty *</label>
                    <input 
                      type="number" 
                      name="stockQuantity" 
                      value={formData.stockQuantity} 
                      onChange={handleTextChange} 
                      min={0} 
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label>Low Stock Alert</label>
                    <input 
                      type="number" 
                      name="lowStockAlert" 
                      value={formData.lowStockAlert} 
                      onChange={handleTextChange} 
                      min={0} 
                    />
                  </div>
                </div>

                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Warehouse Storage Code</label>
                  <input 
                    type="text" 
                    name="warehouse" 
                    value={formData.warehouse} 
                    onChange={handleTextChange} 
                    placeholder="e.g. WH-LAHORE-01" 
                  />
                </div>

                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Platform Visibility</label>
                  <Select 
                    value={formData.visibility} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, visibility: val }))}
                  >
                    <SelectTrigger style={{ width: '100%' }}>
                      <SelectValue placeholder="Platform Visibility" />
                    </SelectTrigger>
                    <SelectContent style={{ width: '100%' }}>
                      <SelectItem value="Public">Public (Visible in store)</SelectItem>
                      <SelectItem value="Hidden">Hidden (Private catalog)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group-field" style={{ marginBottom: '20px' }}>
                  <label>Listing Status</label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className={`status-select-colored ${formData.status.toLowerCase()}`} style={{ width: '100%' }}>
                      <SelectValue placeholder="Listing Status" />
                    </SelectTrigger>
                    <SelectContent style={{ width: '100%' }}>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="checkbox-fields-row" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.trackInventory} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, trackInventory: checked }))} 
                    />
                    <span>Track inventory levels</span>
                  </label>
                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.allowBackorder} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowBackorder: checked }))} 
                    />
                    <span>Allow backorders on purchase</span>
                  </label>
                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.featured} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} 
                    />
                    <span>Mark as Featured Product</span>
                  </label>
                  <label className="checkbox-alignment-wrapper">
                    <Checkbox 
                      checked={!!formData.recommended} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recommended: checked }))} 
                    />
                    <span>Suggest in Recommendations</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Card 8: Dynamic Specs Key-Value Table */}
            <Card>
              <CardHeader>
                <CardTitle><ClipboardList size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Custom Specifications</CardTitle>
                <CardDescription>Setup dynamic specifications matrix values (e.g. Material to Cotton).</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <input 
                    type="text" 
                    placeholder="Key (e.g. Material)" 
                    value={specKeyInput} 
                    onChange={e => setSpecKeyInput(e.target.value)} 
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }} 
                  />
                  <input 
                    type="text" 
                    placeholder="Value (e.g. 100% Wool)" 
                    value={specValInput} 
                    onChange={e => setSpecValInput(e.target.value)} 
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }} 
                  />
                  <button type="button" className="pet-btn-primary" onClick={addSpecification} style={{ padding: '8px 12px' }}>
                    <Plus size={16} />
                  </button>
                </div>

                {formData.specifications && formData.specifications.length > 0 ? (
                  <table className="admin-table" style={{ width: '100%', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th>Specification Key</th>
                        <th>Specification Value</th>
                        <th style={{ width: '50px' }}>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.specifications.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.key}</strong></td>
                          <td>{item.value}</td>
                          <td>
                            <button type="button" onClick={() => removeSpecification(idx)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '16px', fontSize: '11px', textAlign: 'center', color: 'var(--color-muted)', background: '#F8FAFC', borderRadius: '10px' }}>
                    No custom specifications added.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 9: Search Engine Optimization (SEO) */}
            <Card>
              <CardHeader>
                <CardTitle><Globe size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />Search Engine Optimization (SEO)</CardTitle>
                <CardDescription>Setup search results snippet visual details, meta titles and tag queries.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="form-group-field" style={{ marginBottom: '14px' }}>
                  <label>SEO Meta Title</label>
                  <input 
                    type="text" 
                    name="seoTitle" 
                    value={formData.seoTitle} 
                    onChange={handleTextChange} 
                    placeholder="Custom meta page title tag..." 
                  />
                </div>
                <div className="form-group-field" style={{ marginBottom: '14px' }}>
                  <label>SEO Meta Description</label>
                  <textarea 
                    name="metaDescription" 
                    value={formData.metaDescription} 
                    onChange={handleTextChange} 
                    placeholder="Provide concise search descriptive summary copy (max 160 characters)..." 
                    rows={3}
                  />
                </div>
                <div className="form-group-field">
                  <label>SEO Target Keywords (Comma Separated)</label>
                  <input 
                    type="text" 
                    name="seoKeywords" 
                    value={formData.seoKeywords} 
                    onChange={handleTextChange} 
                    placeholder="e.g. petfood, dogkibble, freshpet" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 10: Product Copilot Assistant AI */}
            <Card className="ai-assistant-card" style={{ border: '1.5px solid rgba(139, 92, 246, 0.2)' }}>
              <CardHeader>
                <CardTitle><Sparkles size={18} color="#8B5CF6" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />AI Copilot assistant</CardTitle>
                <CardDescription>Generate tags, auto summarize SEO page details, descriptions, or check duplicated SKUs using AI.</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <button type="button" className="ai-btn" onClick={() => triggerAIGenerator('Description')}>
                    Generate Description
                  </button>
                  <button type="button" className="ai-btn" onClick={() => triggerAIGenerator('SEO Meta')}>
                    Generate SEO Summary
                  </button>
                  <button type="button" className="ai-btn" onClick={() => triggerAIGenerator('Tags')}>
                    Generate Keywords Tags
                  </button>
                  <button type="button" className="ai-btn" onClick={() => triggerAIGenerator('Background')}>
                    Remove Picture Background
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    );
  }

  // STANDARD PRODUCT LIST VIEW
  return (
    <div className="prod-manager-container fade-in">
      
      {/* Detail Modal View */}
      {view === 'detail' && selectedProduct && (
        <div className="modal-backdrop" onClick={() => setView('list')}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-close-header">
              <h3>Product Specifications Telemetry</h3>
              <button className="modal-close-x" onClick={() => setView('list')}>×</button>
            </div>
            
            <div className="modal-body-split">
              <div className="modal-gallery-view">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="modal-main-image" />
                ) : (
                  <div className="modal-no-img"><ImageIcon size={48} /></div>
                )}
                
                <div className="modal-gallery-row">
                  {selectedProduct.images && selectedProduct.images.slice(1).map((img, idx) => (
                    <img key={idx} src={img} alt="Gallery" className="modal-gallery-thumb" />
                  ))}
                </div>
              </div>

              <div className="modal-meta-view">
                <h2 className="modal-prod-name">{selectedProduct.name}</h2>
                <div className="modal-category-brand-row">
                  <span className="modal-cat-badge">{selectedProduct.category?.name || 'Uncategorized'}</span>
                  {selectedProduct.brand && <span className="modal-brand-label">by {selectedProduct.brand}</span>}
                </div>

                <div className="modal-price-box">
                  {selectedProduct.salePrice ? (
                    <>
                      <span className="modal-sale-price">{selectedProduct.salePrice.toLocaleString()} PKR</span>
                      <span className="modal-reg-price-crossed">{selectedProduct.regularPrice.toLocaleString()} PKR</span>
                      <span className="modal-discount-tag">{selectedProduct.discount}% OFF</span>
                    </>
                  ) : (
                    <span className="modal-sale-price">{selectedProduct.regularPrice.toLocaleString()} PKR</span>
                  )}
                </div>

                <div className="specs-details-grid">
                  <div className="spec-detail-item"><strong>SKU Code:</strong> <span>{selectedProduct.sku}</span></div>
                  {selectedProduct.barcode && <div className="spec-detail-item"><strong>Barcode:</strong> <span>{selectedProduct.barcode}</span></div>}
                  <div className="spec-detail-item"><strong>Stock Status:</strong> <span className={`status-badge-pill ${selectedProduct.stockStatus.replace(' ', '-').toLowerCase()}`}>{selectedProduct.stockStatus} ({selectedProduct.stockQuantity} items)</span></div>
                  {selectedProduct.weight && <div className="spec-detail-item"><strong>Weight:</strong> <span>{selectedProduct.weight}</span></div>}
                  {selectedProduct.dimensions && <div className="spec-detail-item"><strong>Dimensions:</strong> <span>{selectedProduct.dimensions}</span></div>}
                  {selectedProduct.petType && <div className="spec-detail-item"><strong>Target Pet:</strong> <span>{selectedProduct.petType}</span></div>}
                  {selectedProduct.ageGroup && <div className="spec-detail-item"><strong>Target Age:</strong> <span>{selectedProduct.ageGroup}</span></div>}
                  <div className="spec-detail-item"><strong>Visibility:</strong> <span>{selectedProduct.visibility}</span></div>
                </div>

                {selectedProduct.description && (
                  <div className="modal-description-box">
                    <strong>Full Details Description</strong>
                    <p>{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Header */}
      <div className="cat-header-section">
        <div>
          <h2 className="cat-title">Product Catalog Inventory</h2>
          <span className="cat-subtitle">Register store items, update price markdowns, adjust stock quantities, and duplicate listings.</span>
        </div>
        <button className="pet-btn-primary" onClick={handleAddNewClick}>
          <Plus size={16} style={{ marginRight: '6px' }} />
          Add Product
        </button>
      </div>

      {/* Bulk Operations Alert Panel */}
      {selectedIds.length > 0 && (
        <div className="bulk-alert-panel">
          <span className="bulk-selected-count">{selectedIds.length} products selected</span>
          <div className="bulk-actions-group">
            <button className="bulk-btn activate" onClick={() => executeBulkAction('status', 'Published')}>
              <CheckCircle size={14} /> Publish
            </button>
            <button className="bulk-btn deactive" onClick={() => executeBulkAction('status', 'Draft')}>
              <Archive size={14} /> Save Draft
            </button>
            <button className="bulk-btn delete" onClick={() => executeBulkAction('delete')}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="cat-filter-row">
        <div className="search-box-wrapper" style={{ flex: 1, maxWidth: '280px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '6px 16px', backgroundColor: 'var(--color-bg-light)' }}>
          <Search size={16} color="var(--color-muted)" />
          <input 
            type="text" 
            placeholder="Search SKU, name, brand..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '13px' }} 
          />
        </div>

        <div className="filters-right">
          <Select 
            value={categoryFilter} 
            onValueChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
          >
            <SelectTrigger className="admin-select">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent style={{ width: '200px' }}>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={statusFilter} 
            onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          >
            <SelectTrigger className={`status-select-colored ${statusFilter.toLowerCase()}`}>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <button className="refresh-icon-btn" onClick={fetchData} title="Refresh dataset">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {processedProducts.length === 0 ? (
        <div className="pet-empty-container" style={{ padding: '80px 20px', background: 'var(--color-white)', borderRadius: '20px', border: '1px solid var(--color-border)', textAlign: 'center', marginTop: '20px' }}>
          <PackageOpen size={48} color="var(--color-muted)" style={{ marginBottom: '14px' }} />
          <h4 className="pet-empty-title">No products found</h4>
          <span className="pet-empty-subtitle" style={{ display: 'block', marginBottom: '18px', fontSize: '12px' }}>Start listing items in your eCommerce store inventory catalog.</span>
          <button className="pet-btn-primary" onClick={handleAddNewClick} style={{ display: 'inline-flex', margin: '0 auto' }}>
            <Plus size={16} style={{ marginRight: '6px' }} /> Add Product Listing
          </button>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p._id))}
                  />
                </th>
                <th>Image</th>
                <th className="sortable-header" onClick={() => handleSort('name')}>
                  Product {sortField === 'name' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                </th>
                <th className="sortable-header" onClick={() => handleSort('category')}>
                  Category {sortField === 'category' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                </th>
                <th>Brand</th>
                <th className="sortable-header" onClick={() => handleSort('regularPrice')}>
                  Price {sortField === 'regularPrice' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                </th>
                <th className="sortable-header" onClick={() => handleSort('stockQuantity')}>
                  Stock {sortField === 'stockQuantity' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                </th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(prod => (
                <tr key={prod._id} className={selectedIds.includes(prod._id) ? 'selected-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(prod._id)}
                      onChange={(e) => handleSelectRow(prod._id, e.target.checked)}
                    />
                  </td>
                  <td>
                    {prod.images && prod.images.length > 0 ? (
                      <img src={prod.images[0]} alt={prod.name} className="cat-row-img" />
                    ) : (
                      <div className="cat-placeholder-icon"><ImageIcon size={16} /></div>
                    )}
                  </td>
                  <td>
                    <span className="prod-row-name">{prod.name}</span>
                    <span className="prod-row-sku">SKU: {prod.sku}</span>
                  </td>
                  <td>
                    <span className="prod-row-cat">{prod.category?.name || 'Uncategorized'}</span>
                  </td>
                  <td>
                    <span className="prod-row-brand">{prod.brand || 'N/A'}</span>
                  </td>
                  <td>
                    {prod.salePrice ? (
                      <div className="prod-row-price-box">
                        <span className="price-sale">{prod.salePrice.toLocaleString()} PKR</span>
                        <span className="price-regular-crossed">{prod.regularPrice.toLocaleString()} PKR</span>
                      </div>
                    ) : (
                      <span className="price-regular">{prod.regularPrice.toLocaleString()} PKR</span>
                    )}
                  </td>
                  <td>
                    <span className={`prod-stock-badge ${prod.stockStatus.replace(' ', '-').toLowerCase()}`}>
                      {prod.stockStatus} ({prod.stockQuantity})
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-pill ${prod.status.toLowerCase()}`}>
                      {prod.status}
                    </span>
                  </td>
                  <td>
                    <span className="user-joined-date">
                      {prod.createdAt ? new Date(prod.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      <button className="action-btn view-btn" onClick={() => { setSelectedProduct(prod); setView('detail'); }} title="Quick View">
                        <Eye size={14} />
                      </button>
                      <button className="action-btn edit-btn" onClick={() => handleEditClick(prod)} title="Edit Listing">
                        <Edit size={14} />
                      </button>
                      <button className="action-btn duplicate-btn" onClick={() => handleDuplicate(prod._id)} title="Duplicate Listing">
                        <Copy size={14} />
                      </button>
                      <button className="action-btn archive-btn" onClick={() => handleDuplicate(prod._id)} title="Duplicate Listing">
                        <Archive size={14} />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(prod._id)} title="Delete Listing">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="admin-pagination-bar">
              <span className="pagination-info">Showing page {currentPage} of {totalPages} ({processedProducts.length} products total)</span>
              <div className="pagination-buttons">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="page-nav-btn"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i} 
                    className={`page-num-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="page-nav-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmConfig !== null} onOpenChange={(open) => { if (!open) setConfirmConfig(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmConfig?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmConfig?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              variant={confirmConfig?.isDanger ? 'danger' : 'primary'} 
              onClick={async () => {
                if (confirmConfig?.onConfirm) {
                  await confirmConfig.onConfirm();
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
