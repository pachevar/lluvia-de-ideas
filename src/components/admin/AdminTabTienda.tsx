import { useState, useRef, useMemo, useEffect } from 'react';
import type { PortalConfig } from '../../types';
import { 
  DEFAULT_MERCADO_PRODUCTS, 
  DEFAULT_BOOK_COLLECTIONS,
  DEFAULT_MERCADO_DEPARTMENTS,
  type MercadoProduct,
  type BookCollection,
  type CollectionIncludedBook,
  type MercadoCategory
} from '../../data/mercadoData';
import { usePortalConfig } from '../../context/PortalConfigContext';
import { uploadImageToStorage, shrinkBase64Image } from '../../utils/imageUpload';
import { soundEffects } from '../../utils/soundEffects';
import './AdminTabTienda.css';

const createEmptyDepartment = (currentLength: number): MercadoCategory => ({
  id: `dept-${Date.now()}`,
  label: '',
  icon: '📦',
  description: '',
  order: currentLength + 1
});

interface AdminTabTiendaProps {
  localConfig: PortalConfig;
  setLocalConfig: React.Dispatch<React.SetStateAction<PortalConfig | null>>;
  updateField?: (section: string, field: string, value: unknown) => void;
  onSave?: () => Promise<void> | void;
  saving?: boolean;
}

const POPULAR_EMOJIS = [
  '📚', '📖', '🎲', '♟️', '🎭', '🎴', '🃏', '🚀', 
  '🔬', '🎨', '🖍️', '🌽', '🧭', '🧪', '🧬', '⚡', 
  '🪐', '👑', '🦖', '🎒', '🧩', '📝', '✂️', '🏺'
];

const BADGE_PRESETS = [
  'MÁS VENDIDO',
  'OFERTA RELÁMPAGO',
  'EXCLUSIVO EDITORIAL',
  'RECOMENDADO DOCENTE',
  'TENDENCIA',
  'NUEVO LANZAMIENTO',
  'EDICIÓN LIMITADA'
];

const createEmptyProduct = (): MercadoProduct => ({
  id: `prod-${Date.now()}`,
  title: '',
  category: 'cuentos',
  categoryLabel: 'Cuentos y Libros',
  price: 50.00,
  originalPrice: 65.00,
  currency: 'Q',
  rating: 5.0,
  reviewsCount: 1,
  soldCount: 10,
  deliveryTime: 'Entrega 24-48 hrs en toda Guatemala',
  badge: 'NUEVO LANZAMIENTO',
  icon: '📚',
  gradeOrAge: 'Primaria & Básicos',
  author: 'Editorial Lluvia de Ideas',
  pages: 64,
  formatType: 'Kindle eBook & Tapa Dura',
  coverTheme: 'amber',
  description: '',
  longDescription: '',
  features: [
    'Material pedagógico certificado',
    'Integración curricular para el aula'
  ],
  contents: [
    '1 Set completo con guía de uso'
  ],
  featured: true,
  inStock: true
});

const createEmptyCollection = (): BookCollection => ({
  id: `col-${Date.now()}`,
  title: '',
  subtitle: 'Colección de 5 Obras Maestras Ilustradas',
  badge: 'PACK COLECCIÓN COMPLETA',
  description: '',
  price: 440.00,
  originalPrice: 550.00,
  currency: 'Q',
  gradeOrAge: 'Primaria & Ciclo Básico',
  rating: 5.0,
  reviewsCount: 1,
  soldCount: 0,
  themeColor: '#0284c7',
  accentGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
  features: [
    '5 Libros en pasta dura a todo color de alta definición',
    'Glosario pedagógico y mapa cosmológico incluido',
    'Caja conmemorativa de colección'
  ],
  onlySoldAsPack: true,
  includedBooks: [
    {
      id: `book-${Date.now()}-1`,
      title: '',
      author: 'Editorial Lluvia de Ideas',
      pages: 48,
      description: '',
      coverTheme: 'amber'
    },
    {
      id: `book-${Date.now()}-2`,
      title: '',
      author: 'Editorial Lluvia de Ideas',
      pages: 48,
      description: '',
      coverTheme: 'cyan'
    },
    {
      id: `book-${Date.now()}-3`,
      title: '',
      author: 'Editorial Lluvia de Ideas',
      pages: 48,
      description: '',
      coverTheme: 'emerald'
    },
    {
      id: `book-${Date.now()}-4`,
      title: '',
      author: 'Editorial Lluvia de Ideas',
      pages: 48,
      description: '',
      coverTheme: 'purple'
    },
    {
      id: `book-${Date.now()}-5`,
      title: '',
      author: 'Editorial Lluvia de Ideas',
      pages: 48,
      description: '',
      coverTheme: 'ruby'
    }
  ]
});

export default function AdminTabTienda({ localConfig, setLocalConfig, onSave, saving }: AdminTabTiendaProps) {
  const { 
    saveMercadoCollectionsToFirestore, 
    saveMercadoProductsToFirestore,
    saveMercadoCategoriesToFirestore 
  } = usePortalConfig();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Productos activos (Inicia con productos configurados o catálogo base)
  const products: MercadoProduct[] = useMemo(() => {
    if (localConfig.mercadoProducts !== undefined && Array.isArray(localConfig.mercadoProducts) && localConfig.mercadoProducts.length > 0) {
      return localConfig.mercadoProducts as MercadoProduct[];
    }
    return DEFAULT_MERCADO_PRODUCTS;
  }, [localConfig.mercadoProducts]);

  // Colecciones y Packs activos (Inicia con colecciones configuradas o colecciones base)
  const collections: BookCollection[] = useMemo(() => {
    if (localConfig.mercadoCollections !== undefined && Array.isArray(localConfig.mercadoCollections) && localConfig.mercadoCollections.length > 0) {
      return localConfig.mercadoCollections as BookCollection[];
    }
    return DEFAULT_BOOK_COLLECTIONS;
  }, [localConfig.mercadoCollections]);

  // Departamentos y Categorías activas (Inicia con departamentos configurados o departamentos base)
  const departments: MercadoCategory[] = useMemo(() => {
    if (localConfig.mercadoCategories !== undefined && Array.isArray(localConfig.mercadoCategories) && localConfig.mercadoCategories.length > 0) {
      return [...localConfig.mercadoCategories].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return DEFAULT_MERCADO_DEPARTMENTS;
  }, [localConfig.mercadoCategories]);

  // Subpestaña activa (Productos vs Colecciones vs Departamentos)
  const [adminSubTab, setAdminSubTab] = useState<'productos' | 'colecciones' | 'departamentos'>('productos');

  // Estados de Departamento / Categoría
  const [editingDepartment, setEditingDepartment] = useState<MercadoCategory | null>(null);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState<boolean>(false);
  const [originalDepartmentId, setOriginalDepartmentId] = useState<string | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<MercadoCategory | null>(null);
  const [reassignCategoryTo, setReassignCategoryTo] = useState<string>('');

  // Estados de Colección
  const [editingCollection, setEditingCollection] = useState<BookCollection | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState<boolean>(false);
  const [uploadingBookCoverIdx, setUploadingBookCoverIdx] = useState<number | null>(null);
  const [syncCollectionAsProduct, setSyncCollectionAsProduct] = useState<boolean>(true);

  const colCoverInputRef = useRef<HTMLInputElement>(null);

  // Configuración del Mercado
  const mercadoConfig = localConfig.mercadoConfig || {
    announcement: "Envíos a todo el país en 24-48 hrs · Descuentos por volumen para colegios y docentes",
    whatsappPhone: "50246741239",
    bannerTitle: "Mercado Educativo & Creativo",
    bannerSubtitle: "Materiales didácticos, cuentos y proyectos pedagógicos directos de la editorial",
    showPromoStrip: true
  };

  // Estados de interfaz de productos
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<MercadoProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [restoredDraftNotice, setRestoredDraftNotice] = useState<string | null>(null);

  // Auto-recuperación de borrador local si la lista de colecciones está vacía
  useEffect(() => {
    if (collections.length === 0) {
      try {
        const draft = localStorage.getItem('mercado_collections_draft');
        if (draft) {
          const parsed = JSON.parse(draft);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocalConfig(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                mercadoCollections: parsed
              };
            });
            setRestoredDraftNotice(`Se restauró tu colección "${parsed[0]?.title || 'Pack de libros'}" con sus imágenes y datos.`);
          }
        }
      } catch (e) {
        console.warn('[AdminTabTienda] Error al recuperar borrador:', e);
      }
    }
  }, []);

  // Actualizar colecciones en localConfig y persistir inmediatamente en Firestore y localStorage
  const commitCollections = async (nextCollections: BookCollection[]) => {
    try {
      localStorage.setItem('mercado_collections_draft', JSON.stringify(nextCollections));
    } catch (e) {
      console.warn('[AdminTabTienda] Warning guardando borrador:', e);
    }
    setLocalConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mercadoCollections: nextCollections
      };
    });
    try {
      await saveMercadoCollectionsToFirestore(nextCollections);
      showToast('✓ Colección guardada y sincronizada en Firestore');
    } catch (e) {
      console.warn('[AdminTabTienda] Error guardando colecciones en Firestore:', e);
    }
  };

  // Actualizar lista de productos en localConfig y persistir inmediatamente en Firestore y localStorage
  const commitProducts = async (nextProducts: MercadoProduct[]) => {
    try {
      localStorage.setItem('mercado_products_draft', JSON.stringify(nextProducts));
    } catch (e) {
      console.warn('[AdminTabTienda] Warning guardando borrador de productos:', e);
    }
    setLocalConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mercadoProducts: nextProducts
      };
    });
    try {
      await saveMercadoProductsToFirestore(nextProducts);
      showToast('✓ Producto guardado y sincronizado en Firestore');
    } catch (e) {
      console.warn('[AdminTabTienda] Error guardando productos en Firestore:', e);
    }
  };

  // Actualizar departamentos en localConfig y persistir en Firestore y localStorage
  const commitDepartments = async (nextDepartments: MercadoCategory[]) => {
    const ordered = nextDepartments.map((dept, index) => ({
      ...dept,
      order: index + 1
    }));

    try {
      localStorage.setItem('mercado_categories_draft', JSON.stringify(ordered));
    } catch (e) {
      console.warn('[AdminTabTienda] Warning guardando borrador categorías:', e);
    }

    setLocalConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mercadoCategories: ordered
      };
    });

    try {
      await saveMercadoCategoriesToFirestore(ordered);
      showToast('✓ Departamentos guardados y sincronizados');
    } catch (e) {
      console.warn('[AdminTabTienda] Error guardando categorías en Firestore:', e);
      showToast('⚠️ Guardado local. Se subirá con la sincronización general.');
    }
  };

  const handleOpenNewDepartment = () => {
    soundEffects.playClick();
    setEditingDepartment(createEmptyDepartment(departments.length));
    setOriginalDepartmentId(null);
    setIsDepartmentModalOpen(true);
  };

  const handleOpenEditDepartment = (dept: MercadoCategory) => {
    soundEffects.playClick();
    setEditingDepartment({ ...dept });
    setOriginalDepartmentId(dept.id);
    setIsDepartmentModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    const cleanLabel = editingDepartment.label.trim();
    if (!cleanLabel) {
      alert('Por favor ingresa un nombre para el departamento.');
      return;
    }

    let cleanId = editingDepartment.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!cleanId) {
      cleanId = cleanLabel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    }

    // Verificar ID duplicado
    const isDuplicate = departments.some(d => d.id === cleanId && d.id !== originalDepartmentId);
    if (isDuplicate) {
      alert(`Ya existe un departamento con el identificador "${cleanId}". Por favor usa otro ID.`);
      return;
    }

    const finalDept: MercadoCategory = {
      ...editingDepartment,
      id: cleanId,
      label: cleanLabel,
      icon: editingDepartment.icon?.trim() || '📦'
    };

    let nextDepts: MercadoCategory[];
    if (originalDepartmentId) {
      nextDepts = departments.map(d => d.id === originalDepartmentId ? finalDept : d);
      
      // Si el ID cambió, actualizar todos los productos que usaban el ID anterior
      if (originalDepartmentId !== cleanId) {
        const updatedProducts = products.map(p => {
          if (p.category === originalDepartmentId) {
            return {
              ...p,
              category: cleanId,
              categoryLabel: cleanLabel
            };
          }
          return p;
        });
        await commitProducts(updatedProducts);
      }
    } else {
      nextDepts = [...departments, finalDept];
    }

    await commitDepartments(nextDepts);
    setIsDepartmentModalOpen(false);
    setEditingDepartment(null);
    setOriginalDepartmentId(null);
    soundEffects.playSuccessFanfare();
    showToast(originalDepartmentId ? '✓ Departamento modificado exitosamente' : '✨ Nuevo departamento creado exitosamente');
  };

  const handleMoveDepartment = async (deptId: string, direction: -1 | 1) => {
    soundEffects.playClick();
    const idx = departments.findIndex(d => d.id === deptId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= departments.length) return;

    const reordered = [...departments];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    await commitDepartments(reordered);
  };

  const handlePromptDeleteDepartment = (dept: MercadoCategory) => {
    soundEffects.playClick();
    setDepartmentToDelete(dept);
    const otherCat = departments.find(d => d.id !== dept.id);
    setReassignCategoryTo(otherCat ? otherCat.id : '');
  };

  const handleConfirmDeleteDepartment = async (reassign: boolean) => {
    if (!departmentToDelete) return;
    soundEffects.playClick();
    const deptId = departmentToDelete.id;

    // Si hay reasignación de productos
    if (reassign && reassignCategoryTo) {
      const targetDept = departments.find(d => d.id === reassignCategoryTo);
      const updatedProducts = products.map(p => {
        if (p.category === deptId) {
          return {
            ...p,
            category: reassignCategoryTo,
            categoryLabel: targetDept ? targetDept.label : 'General'
          };
        }
        return p;
      });
      await commitProducts(updatedProducts);
    }

    const nextDepts = departments.filter(d => d.id !== deptId);
    await commitDepartments(nextDepts);

    setDepartmentToDelete(null);
    setReassignCategoryTo('');
    soundEffects.playSuccessFanfare();
    showToast('✓ Departamento eliminado del catálogo');
  };

  const handleRestoreDefaultDepartments = async () => {
    if (window.confirm('¿Restaurar los 6 departamentos pedagógicos originales de la editorial? No se eliminarán tus productos existentes.')) {
      soundEffects.playClick();
      await commitDepartments(DEFAULT_MERCADO_DEPARTMENTS);
      soundEffects.playSuccessFanfare();
      showToast('♻️ Departamentos base restaurados exitosamente');
    }
  };

  // Actualizar mercadoConfig
  const updateMercadoConfig = (field: string, value: unknown) => {
    setLocalConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mercadoConfig: {
          ...(prev.mercadoConfig || {}),
          [field]: value
        }
      };
    });
  };

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'todos') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.gradeOrAge.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, selectedCategory, searchTerm]);

  // Abrir modal de nuevo producto
  const handleOpenNew = () => {
    soundEffects.playClick();
    setEditingProduct(createEmptyProduct());
    setIsModalOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (product: MercadoProduct) => {
    soundEffects.playClick();
    setEditingProduct({ 
      ...product,
      features: [...(product.features || [])],
      contents: [...(product.contents || [])]
    });
    setIsModalOpen(true);
  };

  // Guardar producto desde modal
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editingProduct.title.trim()) {
      alert('Por favor, ingresa al menos un título para el producto.');
      return;
    }

    soundEffects.playClick();
    const sanitizedProduct: MercadoProduct = {
      ...editingProduct,
      title: editingProduct.title.trim(),
      features: (editingProduct.features || []).map(f => f.trim()).filter(f => f.length > 0),
      contents: (editingProduct.contents || []).map(c => c.trim()).filter(c => c.length > 0),
    };

    const exists = products.some(p => p.id === sanitizedProduct.id);
    const next = exists 
      ? products.map(p => p.id === sanitizedProduct.id ? sanitizedProduct : p)
      : [sanitizedProduct, ...products];

    await commitProducts(next);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Duplicar producto
  const handleDuplicateProduct = (product: MercadoProduct) => {
    soundEffects.playClick();
    const copy: MercadoProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      title: `${product.title} (Copia)`,
      features: [...(product.features || [])],
      contents: [...(product.contents || [])]
    };
    commitProducts([copy, ...products]);
  };

  // Eliminar producto
  const handleDeleteProduct = (productId: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${title}" del catálogo?`)) {
      soundEffects.playClick();
      commitProducts(products.filter(p => p.id !== productId));
    }
  };

  // Vaciar todo el catálogo para iniciar limpio
  const handleClearAllProducts = () => {
    if (window.confirm('¿Deseas vaciar todos los productos del catálogo? Se dejará la tienda en 0 productos para que puedas subir los productos oficiales reales. (Podrás restaurar el catálogo base de ejemplo en cualquier momento).')) {
      soundEffects.playClick();
      commitProducts([]);
    }
  };

  // Reordenar producto de forma segura buscando el id en el catálogo maestro
  const handleMoveProduct = (productId: string, direction: -1 | 1) => {
    soundEffects.playClick();
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= products.length) return;
    const next = [...products];
    [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
    commitProducts(next);
  };

  // Restaurar catálogo base
  const handleRestoreDefault = () => {
    if (window.confirm('¿Deseas restaurar la colección oficial inicial de 18 productos del Mercado? Se reemplazarán los cambios actuales no guardados.')) {
      soundEffects.playClick();
      commitProducts(DEFAULT_MERCADO_PRODUCTS);
    }
  };

  // Subida de imagen para producto en tarjeta
  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingForId(productId);
    setUploadStatus('Comprimiendo y subiendo imagen...');
    try {
      const url = await uploadImageToStorage(file, 'mercado-assets');
      commitProducts(products.map(p => p.id === productId ? { ...p, image: url } : p));
      setUploadStatus('¡Imagen actualizada!');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploadingForId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Subida de imagen dentro del modal
  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadStatus('Comprimiendo y subiendo imagen de portada...');
    try {
      const url = await uploadImageToStorage(file, 'mercado-assets');
      setEditingProduct(prev => prev ? { ...prev, image: url } : prev);
      setUploadStatus('¡Portada cargada con éxito!');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      console.error('Error subiendo imagen modal:', err);
      alert('Error al subir la imagen.');
    } finally {
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  // Abrir modal nueva colección (Preconfigurado con 5 libros y solo venta en pack)
  const handleOpenNewCollection = () => {
    soundEffects.playClick();
    setEditingCollection(createEmptyCollection());
    setSyncCollectionAsProduct(true);
    setIsCollectionModalOpen(true);
  };

  // Abrir modal editar colección
  const handleOpenEditCollection = (col: BookCollection) => {
    soundEffects.playClick();
    setEditingCollection({
      ...col,
      features: [...(col.features || [])],
      includedBooks: (col.includedBooks || []).map(b => ({ ...b }))
    });
    setSyncCollectionAsProduct(true);
    setIsCollectionModalOpen(true);
  };

  // Eliminar colección
  const handleDeleteCollection = (colId: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta colección? Se quitará de la vista de colecciones.')) {
      soundEffects.playClick();
      commitCollections(collections.filter(c => c.id !== colId));
      commitProducts(products.filter(p => p.id !== `bundle-${colId}`));
    }
  };

  // Vaciar colecciones
  const handleClearAllCollections = () => {
    if (window.confirm('¿Deseas vaciar todas las colecciones? Podrás crearlas de nuevo cuando lo requieras.')) {
      soundEffects.playClick();
      commitCollections([]);
      commitProducts(products.filter(p => !p.id.startsWith('bundle-col-')));
    }
  };

  // Agregar ranura de libro a la colección en edición
  const handleAddBookToCollection = () => {
    if (!editingCollection) return;
    soundEffects.playClick();
    const nextIdx = (editingCollection.includedBooks?.length || 0) + 1;
    const newBook: CollectionIncludedBook = {
      id: `book-${Date.now()}-${nextIdx}`,
      title: '',
      author: 'Editorial Lluvia de Ideas',
      pages: 48,
      description: '',
      coverTheme: nextIdx % 2 === 0 ? 'cyan' : 'amber'
    };
    setEditingCollection({
      ...editingCollection,
      includedBooks: [...(editingCollection.includedBooks || []), newBook]
    });
  };

  // Quitar ranura de libro de la colección
  const handleRemoveBookFromCollection = (idx: number) => {
    if (!editingCollection) return;
    soundEffects.playClick();
    const nextBooks = [...(editingCollection.includedBooks || [])];
    nextBooks.splice(idx, 1);
    setEditingCollection({
      ...editingCollection,
      includedBooks: nextBooks
    });
  };

  // Actualizar campo de un libro de la colección
  const handleUpdateIncludedBook = (idx: number, field: keyof CollectionIncludedBook, value: any) => {
    if (!editingCollection) return;
    const nextBooks = [...(editingCollection.includedBooks || [])];
    nextBooks[idx] = {
      ...nextBooks[idx],
      [field]: value
    };
    setEditingCollection({
      ...editingCollection,
      includedBooks: nextBooks
    });
  };

  // Subir portada del pack completo
  const handleColCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCollection) return;

    setUploadStatus('Comprimiendo y subiendo portada de la colección...');
    try {
      const url = await uploadImageToStorage(file, 'mercado-assets');
      setEditingCollection(prev => prev ? ({ ...prev, image: url }) : null);
      setUploadStatus('¡Portada de colección cargada!');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      console.error('Error subiendo imagen de colección:', err);
      alert('Error al subir la imagen de la colección.');
    } finally {
      if (colCoverInputRef.current) colCoverInputRef.current.value = '';
    }
  };

  // Subir portada de un libro individual dentro del pack
  const handleBookCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingCollection) return;

    setUploadingBookCoverIdx(idx);
    setUploadStatus(`Subiendo portada del Libro #${idx + 1}...`);
    try {
      const url = await uploadImageToStorage(file, 'mercado-assets');
      handleUpdateIncludedBook(idx, 'image', url);
      setUploadStatus('¡Portada de libro actualizada!');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      console.error('Error subiendo portada de libro:', err);
      alert('Error al subir la portada del libro.');
    } finally {
      setUploadingBookCoverIdx(null);
    }
  };

  // Guardar colección desde modal
  const handleSaveCollection = async () => {
    if (!editingCollection) return;
    if (!editingCollection.title.trim()) {
      alert('Por favor escribe un título para la colección.');
      return;
    }

    const cleanFeatures = (editingCollection.features || [])
      .map(f => f.trim())
      .filter(f => f.length > 0);

    // Comprimir portadas de libros si son Base64 para que sean ultra livianas (< 20KB cada una)
    const cleanIncludedBooks: CollectionIncludedBook[] = await Promise.all(
      (editingCollection.includedBooks || [])
        .filter(b => b.title.trim().length > 0)
        .map(async (b, idx) => {
          let bookImg = b.image?.trim() || undefined;
          if (bookImg && bookImg.startsWith('data:')) {
            bookImg = await shrinkBase64Image(bookImg, 380, 520, 0.65);
          }
          return {
            ...b,
            id: b.id || `book-${editingCollection.id}-${idx + 1}`,
            title: b.title.trim(),
            author: b.author?.trim() || 'Editorial Lluvia de Ideas',
            description: b.description?.trim() || '',
            image: bookImg,
            isbn: b.isbn?.trim() || undefined
          };
        })
    );

    let packCover = editingCollection.image?.trim() || undefined;
    if (packCover && packCover.startsWith('data:')) {
      packCover = await shrinkBase64Image(packCover, 480, 640, 0.68);
    }

    const nextCol: BookCollection = {
      ...editingCollection,
      title: editingCollection.title.trim(),
      subtitle: editingCollection.subtitle?.trim() || '',
      badge: editingCollection.badge?.trim() || 'PACK COLECCIÓN COMPLETA',
      description: editingCollection.description?.trim() || '',
      price: Number(editingCollection.price) || 0,
      originalPrice: Number(editingCollection.originalPrice) || Number(editingCollection.price) || 0,
      currency: editingCollection.currency || 'Q',
      gradeOrAge: editingCollection.gradeOrAge || 'Primaria & Ciclo Básico',
      features: cleanFeatures,
      image: packCover,
      includedBooks: cleanIncludedBooks,
      onlySoldAsPack: editingCollection.onlySoldAsPack !== false
    };

    const exists = collections.some(c => c.id === nextCol.id);
    const nextCollections = exists
      ? collections.map(c => c.id === nextCol.id ? nextCol : c)
      : [nextCol, ...collections];

    await commitCollections(nextCollections);

    // Sincronizar en el catálogo general si está marcado
    if (syncCollectionAsProduct) {
      const bundleProductId = `bundle-${nextCol.id}`;
      const cleanProducts = products.filter(p => p.id !== bundleProductId);
      const bundleProduct: MercadoProduct = {
        id: bundleProductId,
        title: `Colección: ${nextCol.title} (${cleanIncludedBooks.length} Libros)`,
        category: 'cuentos',
        categoryLabel: 'Colección de Libros',
        price: nextCol.price,
        originalPrice: nextCol.originalPrice > nextCol.price ? nextCol.originalPrice : undefined,
        currency: nextCol.currency || 'Q',
        rating: nextCol.rating || 5.0,
        reviewsCount: nextCol.reviewsCount || 1,
        soldCount: nextCol.soldCount || 0,
        deliveryTime: 'Entrega 24-48 hrs en caja conmemorativa',
        description: nextCol.description,
        longDescription: `${nextCol.subtitle}. Incluye los ${cleanIncludedBooks.length} títulos de la saga: ${cleanIncludedBooks.map(b => b.title).join(', ')}.`,
        badge: nextCol.badge || 'PACK COLECCIÓN',
        icon: '📦',
        image: nextCol.image || cleanIncludedBooks[0]?.image,
        gradeOrAge: nextCol.gradeOrAge,
        features: nextCol.features,
        contents: cleanIncludedBooks.map(b => `1x ${b.title}`),
        featured: true,
        inStock: true,
        collectionId: nextCol.id,
        collectionName: nextCol.title
      };
      await commitProducts([bundleProduct, ...cleanProducts]);
    }

    soundEffects.playSuccessFanfare();
    setIsCollectionModalOpen(false);
    setEditingCollection(null);
  };

  // Categorías con conteos dinámicos
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: products.length };
    departments.forEach(cat => {
      counts[cat.id] = products.filter(p => p.category === cat.id).length;
    });
    return counts;
  }, [products, departments]);

  return (
    <div className="admin-mercado-wrapper animate-fade-in">
      {restoredDraftNotice && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
          border: '1px solid rgba(52, 211, 153, 0.45)',
          borderRadius: '12px',
          padding: '12px 18px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🛡️</span>
            <div>
              <strong style={{ display: 'block', color: '#6ee7b7', fontSize: '0.92rem' }}>Información Conservada Exitosamente</strong>
              <span style={{ fontSize: '0.84rem', color: '#e2e8f0' }}>{restoredDraftNotice} Haz clic en <strong>"💾 Guardar en Firestore"</strong> para asegurarla en la nube sin error de tamaño.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRestoredDraftNotice(null)}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1.1rem', padding: '4px' }}
            title="Descartar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header y Acciones Principales */}
      <div className="admin-mercado-header">
        <div className="admin-mercado-title-group">
          <div className="admin-mercado-icon-wrap">
            <span>🛍️</span>
          </div>
          <div className="admin-mercado-heading">
            <h3>Administrador de Mercado (Tienda Oficial)</h3>
            <p>
              Gestiona el catálogo completo de productos educativos: cuentos, juegos de mesa, personajes, tarjetas, proyectos STEAM y útiles.
            </p>
          </div>
        </div>

        <div className="admin-mercado-top-actions">
          {onSave && (
            <button 
              type="button" 
              className="btn-mercado-save"
              onClick={() => onSave()}
              disabled={saving}
              title="Guardar todos los cambios en Firestore"
            >
              {saving ? '⏳ Guardando en Nube...' : '💾 Guardar en Firestore'}
            </button>
          )}

          {adminSubTab === 'colecciones' ? (
            <>
              {collections.length > 0 && (
                <button 
                  type="button" 
                  className="btn-mercado-clear"
                  onClick={handleClearAllCollections}
                  title="Vaciar todas las colecciones"
                >
                  🗑️ Vaciar Colecciones
                </button>
              )}
              <button 
                type="button" 
                className="btn-mercado-primary"
                onClick={handleOpenNewCollection}
                title="Crear una nueva colección o paquete de libros"
              >
                ＋ Nueva Colección / Pack (5 Libros)
              </button>
            </>
          ) : adminSubTab === 'departamentos' ? (
            <>
              <button 
                type="button" 
                className="btn-mercado-secondary"
                onClick={handleRestoreDefaultDepartments}
                title="Restaurar los 6 departamentos pedagógicos base"
              >
                ♻️ Restaurar Departamentos Base
              </button>
              <button 
                type="button" 
                className="btn-mercado-primary"
                onClick={handleOpenNewDepartment}
                title="Crear un nuevo departamento o categoría"
              >
                ＋ Nuevo Departamento
              </button>
            </>
          ) : (
            <>
              {products.length > 0 && (
                <button 
                  type="button" 
                  className="btn-mercado-clear"
                  onClick={handleClearAllProducts}
                  title="Vaciar todo el catálogo para empezar en 0"
                >
                  🗑️ Vaciar Catálogo
                </button>
              )}
              <button 
                type="button" 
                className="btn-mercado-secondary"
                onClick={handleRestoreDefault}
                title="Restaurar catálogo inicial"
              >
                ♻️ Restaurar Catálogo Base
              </button>
              <button 
                type="button" 
                className="btn-mercado-primary"
                onClick={handleOpenNew}
                title="Crear un nuevo producto"
              >
                ＋ Nuevo Producto
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Configuración Superior de la Tienda (Banner y WhatsApp) */}
      <div className="admin-mercado-config-card">
        <div className="config-card-header">
          <h4 className="config-card-title">
            <span>📢</span> Configuración General de la Tienda
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            Afecta la barra promocional y el canal de ventas directo
          </span>
        </div>

        <div className="admin-mercado-grid-fields">
          <div className="mercado-input-group">
            <label>Cintillo de Anuncio Superior (Promociones / Avisos)</label>
            <textarea
              rows={2}
              value={mercadoConfig.announcement || ''}
              onChange={(e) => updateMercadoConfig('announcement', e.target.value)}
              placeholder="Ej: Envíos a todo el país en 24-48 hrs · Descuentos por volumen para colegios y docentes"
            />
          </div>

          <div className="mercado-input-group">
            <label>WhatsApp Oficial de Pedidos (Código de país sin +)</label>
            <input
              type="text"
              value={mercadoConfig.whatsappPhone || ''}
              onChange={(e) => updateMercadoConfig('whatsappPhone', e.target.value)}
              placeholder="Ej: 50246741239"
            />
          </div>
        </div>
      </div>

      {/* 2.5 Selector de Sub-Pestaña: Productos vs Colecciones vs Departamentos */}
      <div className="admin-tienda-subtabs-nav">
        <button
          type="button"
          className={`admin-tienda-subtab-btn ${adminSubTab === 'productos' ? 'active' : ''}`}
          onClick={() => {
            soundEffects.playClick();
            setAdminSubTab('productos');
          }}
        >
          <span className="subtab-icon">📚</span>
          <span>Productos Individuales</span>
          <span className="subtab-count-badge">{products.length}</span>
        </button>
        <button
          type="button"
          className={`admin-tienda-subtab-btn ${adminSubTab === 'colecciones' ? 'active' : ''}`}
          onClick={() => {
            soundEffects.playClick();
            setAdminSubTab('colecciones');
          }}
        >
          <span className="subtab-icon">📦</span>
          <span>Colecciones y Packs (5 Libros)</span>
          <span className="subtab-count-badge">{collections.length}</span>
        </button>
        <button
          type="button"
          className={`admin-tienda-subtab-btn ${adminSubTab === 'departamentos' ? 'active' : ''}`}
          onClick={() => {
            soundEffects.playClick();
            setAdminSubTab('departamentos');
          }}
        >
          <span className="subtab-icon">🗂️</span>
          <span>Departamentos & Categorías</span>
          <span className="subtab-count-badge">{departments.length}</span>
        </button>
      </div>

      {adminSubTab === 'colecciones' ? (
        <div className="admin-collections-section animate-fade-in">
          {/* Banner explicativo de Colecciones */}
          <div style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.35)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', color: '#e0f2fe', marginTop: '16px' }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
              <strong style={{ display: 'block', color: '#38bdf8', fontSize: '0.98rem', marginBottom: '3px' }}>
                Gestor de Colecciones Pedagógicas y Sagas Literarias
              </strong>
              Aquí puedes crear paquetes de libros completos. Si los 5 libros no se venden por separado, la opción 
              <strong style={{ color: '#fbbf24' }}> "Venta exclusiva en pack"</strong> está activada para que los visitantes puedan revisar la ficha técnica y portada de cada uno de los 5 libros en la estantería 3D, pero únicamente puedan adquirir la colección completa por un solo precio de compra.
            </div>
          </div>

          {collections.length === 0 ? (
            <div className="admin-empty-catalog-hero animate-fade-in" style={{ marginTop: '20px' }}>
              <div className="admin-empty-icon-wrap">
                <span>📦</span>
              </div>
              <h3>Sin Colecciones Registradas (0 colecciones)</h3>
              <p>
                Crea tu primer pack con los 5 libros de la saga. Podrás ingresar los títulos de cada libro, sus portadas, páginas y sinopsis, además del precio de paquete de la colección completa.
              </p>
              <div className="admin-empty-hero-actions">
                <button 
                  type="button" 
                  className="btn-mercado-primary"
                  onClick={handleOpenNewCollection}
                >
                  ＋ Crear Mi Primera Colección de 5 Libros
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-collections-grid">
              {collections.map(col => {
                const totalSavings = col.originalPrice > col.price ? col.originalPrice - col.price : 0;
                return (
                  <div key={col.id} className="admin-collection-card">
                    <div className="col-card-top-row">
                      <span className="col-card-badge">{col.badge}</span>
                      {col.onlySoldAsPack && (
                        <span className="col-card-pack-tag">🔒 Venta Exclusiva en Pack</span>
                      )}
                    </div>

                    <div>
                      <h4 className="col-card-title">{col.title}</h4>
                      <span className="col-card-subtitle">{col.subtitle}</span>
                    </div>

                    <p className="col-card-desc">{col.description}</p>

                    {/* Fila visual de libros componentes */}
                    {col.includedBooks && col.includedBooks.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 650, display: 'block', marginBottom: '6px' }}>
                          📚 {col.includedBooks.length} Libros incluidos en la saga:
                        </span>
                        <div className="col-shelf-preview-strip">
                          {col.includedBooks.map((b, idx) => (
                            <div key={b.id || idx} className="col-shelf-book-thumb" title={b.title || `Libro ${idx + 1}`}>
                              {b.image ? (
                                <img src={b.image} alt={b.title} />
                              ) : (
                                <span>📖 #{idx + 1}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="col-card-footer">
                      <div className="col-card-price-row">
                        <span className="col-card-price">{col.currency} {col.price.toFixed(2)}</span>
                        {col.originalPrice > col.price && (
                          <span className="col-card-orig-price">{col.currency} {col.originalPrice.toFixed(2)}</span>
                        )}
                        {totalSavings > 0 && (
                          <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800 }}>
                            (Ahorro {col.currency} {totalSavings.toFixed(2)})
                          </span>
                        )}
                      </div>

                      <div className="col-card-actions">
                        <button
                          type="button"
                          className="btn-card-icon"
                          onClick={() => handleOpenEditCollection(col)}
                          title="Editar colección"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-card-icon danger"
                          onClick={() => handleDeleteCollection(col.id)}
                          title="Eliminar colección"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : adminSubTab === 'departamentos' ? (
        <div className="admin-departments-section animate-fade-in">
          {/* Banner explicativo de Departamentos */}
          <div style={{ background: 'rgba(255, 122, 0, 0.1)', border: '1px solid rgba(255, 122, 0, 0.35)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', color: '#ffedd5', marginTop: '16px' }}>
            <span style={{ fontSize: '2rem' }}>🗂️</span>
            <div style={{ fontSize: '0.88rem', lineHeight: '1.45' }}>
              <strong style={{ display: 'block', color: '#fb923c', fontSize: '0.98rem', marginBottom: '3px' }}>
                Gestor de Departamentos y Categorías del Mercado
              </strong>
              Aquí puedes modificar los nombres, emojis y descripciones de las secciones de tu tienda, o crear nuevos departamentos pedagógicos (ej: Robótica, Instrumentos, Teatro, etc.). Todo cambio se refleja inmediatamente en el menú vertical de departamentos, el buscador y el catálogo público del Mercado.
            </div>
          </div>

          {departments.length === 0 ? (
            <div className="admin-empty-catalog-hero animate-fade-in" style={{ marginTop: '20px' }}>
              <div className="admin-empty-icon-wrap">
                <span>🗂️</span>
              </div>
              <h3>Sin Departamentos Configurados (0 departamentos)</h3>
              <p>
                No tienes categorías activas en el mercado. Puedes restaurar los 6 departamentos pedagógicos originales o crear uno nuevo.
              </p>
              <div className="admin-empty-hero-actions">
                <button 
                  type="button" 
                  className="btn-mercado-secondary"
                  onClick={handleRestoreDefaultDepartments}
                >
                  ♻️ Restaurar Departamentos Base
                </button>
                <button 
                  type="button" 
                  className="btn-mercado-primary"
                  onClick={handleOpenNewDepartment}
                >
                  ＋ Crear Mi Primer Departamento
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-departments-grid">
              {departments.map((dept, idx) => {
                const count = products.filter(p => p.category === dept.id).length;
                const canMoveUp = idx > 0;
                const canMoveDown = idx < departments.length - 1;

                return (
                  <div key={dept.id} className="admin-dept-card">
                    <div>
                      <div className="admin-dept-card-header">
                        <div className="admin-dept-icon-wrap">
                          <span>{dept.icon}</span>
                        </div>
                        <div className="admin-dept-card-meta">
                          <div className="admin-dept-title-row">
                            <h4 className="admin-dept-card-title">{dept.label}</h4>
                            <span className="admin-dept-order-badge">#{idx + 1}</span>
                          </div>
                          <span className="admin-dept-slug-badge">ID: {dept.id}</span>
                        </div>
                      </div>

                      {dept.description && (
                        <p className="admin-dept-card-desc">{dept.description}</p>
                      )}
                    </div>

                    <div className="admin-dept-card-footer">
                      <span className={`admin-dept-count-badge ${count > 0 ? 'has-items' : 'empty'}`}>
                        <span>🏷️</span>
                        <span>{count} {count === 1 ? 'producto' : 'productos'}</span>
                      </span>

                      <div className="admin-dept-actions-group">
                        <div className="admin-card-reorder-group">
                          <button
                            type="button"
                            className="btn-card-icon"
                            onClick={() => handleMoveDepartment(dept.id, -1)}
                            disabled={!canMoveUp}
                            title="Mover arriba en el menú"
                          >
                            ⬆️
                          </button>
                          <button
                            type="button"
                            className="btn-card-icon"
                            onClick={() => handleMoveDepartment(dept.id, 1)}
                            disabled={!canMoveDown}
                            title="Mover abajo en el menú"
                          >
                            ⬇️
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn-card-icon"
                          onClick={() => handleOpenEditDepartment(dept)}
                          title="Editar departamento"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="btn-card-icon danger"
                          onClick={() => handlePromptDeleteDepartment(dept)}
                          title="Eliminar departamento"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 3. Filtros por Categoría y Buscador */}
          <div className="admin-mercado-filter-strip">
            <div className="admin-mercado-search-bar">
              <span style={{ fontSize: '1.1rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Buscar por título, categoría, grado o palabra clave en el inventario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  type="button" 
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#ffffff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem' }}
                  title="Borrar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="admin-mercado-categories-scroll">
              <button
                type="button"
                className={`admin-cat-pill-btn ${selectedCategory === 'todos' ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory('todos');
                }}
              >
                <span>⚡</span>
                <span>Todo el Catálogo</span>
                <span className="admin-cat-pill-count">{categoryCounts['todos'] || 0}</span>
              </button>
              {departments.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`admin-cat-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedCategory(cat.id);
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="admin-cat-pill-count">{categoryCounts[cat.id] || 0}</span>
                </button>
              ))}
            </div>
          </div>

      {/* Estado de carga de subida */}
      {uploadStatus && (
        <div style={{ background: 'rgba(255, 80, 0, 0.15)', border: '1px solid #ff5000', color: '#ff9a60', padding: '8px 16px', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 800 }}>
          ⚡ {uploadStatus}
        </div>
      )}

      {/* 4. Grilla de Productos */}
      <div className="admin-mercado-products-grid">
        {filteredProducts.map((product) => {
          const discountPercent = product.originalPrice 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;

          return (
            <div key={product.id} className="admin-product-card">
              {/* Parte Superior: Portada y Datos Clave */}
              <div className="admin-product-card-top">
                <div className="admin-product-thumb-box">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="admin-product-thumb-img" />
                  ) : (
                    <span>{product.icon}</span>
                  )}
                  {uploadingForId === product.id && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#ff9a60' }}>
                      ⏳
                    </div>
                  )}
                </div>

                <div className="admin-product-info">
                  <div className="admin-product-badge-row">
                    {product.badge && (
                      <span className="admin-badge-tag">{product.badge}</span>
                    )}
                    <span className="admin-category-tag">{product.categoryLabel}</span>
                  </div>

                  <h4 className="admin-product-title" title={product.title}>
                    {product.title}
                  </h4>

                  <span className="admin-product-grade">
                    🎯 {product.gradeOrAge}
                  </span>
                </div>
              </div>

              {/* Fila de Precios y Social Proof */}
              <div className="admin-product-stats-row">
                <div className="admin-product-price-box">
                  <span className="admin-price-current">Q {product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="admin-price-old">Q {product.originalPrice.toFixed(2)}</span>
                      <span className="admin-discount-pill">-{discountPercent}%</span>
                    </>
                  )}
                </div>

                <div className="admin-product-social">
                  ⭐ {product.rating.toFixed(1)} ({product.reviewsCount})
                  {product.soldCount ? ` · +${product.soldCount}` : ''}
                </div>
              </div>

              {/* Botonera de Acciones de la Tarjeta */}
              <div className="admin-product-card-actions">
                {(() => {
                  const actualIdx = products.findIndex(p => p.id === product.id);
                  const canMoveUp = actualIdx > 0;
                  const canMoveDown = actualIdx !== -1 && actualIdx < products.length - 1;
                  return (
                    <div className="admin-card-reorder-group">
                      <button 
                        type="button" 
                        className="btn-card-icon" 
                        onClick={() => handleMoveProduct(product.id, -1)} 
                        disabled={!canMoveUp}
                        title="Mover hacia arriba en el catálogo"
                      >
                        ⬆️
                      </button>
                      <button 
                        type="button" 
                        className="btn-card-icon" 
                        onClick={() => handleMoveProduct(product.id, 1)} 
                        disabled={!canMoveDown}
                        title="Mover hacia abajo en el catálogo"
                      >
                        ⬇️
                      </button>
                    </div>
                  );
                })()}

                <div className="admin-card-buttons-main">
                  <label className="btn-card-icon" title="Subir foto de portada" style={{ cursor: 'pointer' }}>
                    📷
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => handleCardImageUpload(e, product.id)}
                    />
                  </label>

                  <button 
                    type="button" 
                    className="btn-card-duplicate"
                    onClick={() => handleDuplicateProduct(product)}
                    title="Duplicar este producto"
                  >
                    📋 Duplicar
                  </button>

                  <button 
                    type="button" 
                    className="btn-card-edit"
                    onClick={() => handleOpenEdit(product)}
                    title="Editar producto"
                  >
                    ✏️ Editar
                  </button>

                  <button 
                    type="button" 
                    className="btn-card-delete"
                    onClick={() => handleDeleteProduct(product.id, product.title)}
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="admin-empty-catalog-hero animate-fade-in">
          <div className="admin-empty-icon-wrap">
            <span>✨</span>
          </div>
          <h3>Catálogo en Modo Limpio (0 productos)</h3>
          <p>
            El catálogo está listo para subir los productos oficiales de la editorial. 
            Haz clic en <strong>＋ Nuevo Producto</strong> para registrar tu primer artículo con fotos, descripciones y precios reales,
            o haz clic en <strong>♻️ Restaurar Catálogo Base</strong> si deseas recuperar los 18 productos de ejemplo.
          </p>
          <div className="admin-empty-hero-actions">
            <button 
              type="button" 
              className="btn-mercado-primary"
              onClick={handleOpenNew}
            >
              ＋ Crear Primer Producto Real
            </button>
            <button 
              type="button" 
              className="btn-mercado-secondary"
              onClick={handleRestoreDefault}
            >
              ♻️ Cargar 18 Productos de Ejemplo
            </button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '16px', color: '#cbd5e1' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🔍</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>No se encontraron productos con el filtro aplicado.</p>
          <button 
            className="btn-mercado-primary" 
            style={{ marginTop: '12px' }}
            onClick={() => { setSelectedCategory('todos'); setSearchTerm(''); }}
          >
            Limpiar Filtros
          </button>
        </div>
      ) : null}
        </>
      )}

      {/* ==============================================================
          MODAL DE EDICIÓN COMPLETA DEL PRODUCTO
          ============================================================== */}
      {isModalOpen && editingProduct && (
        <div className="admin-modal-overlay animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="admin-mercado-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="admin-modal-header">
              <h3>
                <span>🛍️</span>
                {editingProduct.id.startsWith('prod-') && !products.some(p => p.id === editingProduct.id) 
                  ? 'Añadir Nuevo Producto al Mercado' 
                  : `Editar: ${editingProduct.title || 'Producto'}`}
              </h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setIsModalOpen(false)}
                title="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo del Modal con Secciones Organizadas */}
            <div className="admin-modal-body-scroll">
              {/* SECCIÓN 1: Identificación y Categoría */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>📌</span> 1. Información General del Producto
                </h4>

                <div className="mercado-input-group">
                  <label>Título Comercial del Producto *</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    placeholder="Ej: El Código del Maíz: Origen y Sustento"
                    required
                  />
                </div>

                <div className="form-grid-3">
                  <div className="mercado-input-group">
                    <label>Categoría / Departamento</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => {
                        const catId = e.target.value;
                        const catObj = departments.find(c => c.id === catId);
                        setEditingProduct({
                          ...editingProduct,
                          category: catId,
                          categoryLabel: catObj ? catObj.label : 'General'
                        });
                      }}
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.icon} {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mercado-input-group">
                    <label>Grado Escolar / Edad Dirigida</label>
                    <input
                      type="text"
                      value={editingProduct.gradeOrAge}
                      onChange={(e) => setEditingProduct({ ...editingProduct, gradeOrAge: e.target.value })}
                      placeholder="Ej: 4to a 6to Primaria"
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Insignia / Badge Comercial</label>
                    <input
                      type="text"
                      value={editingProduct.badge || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                      placeholder="Ej: MÁS VENDIDO, OFERTA..."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 650, width: '100%' }}>Insignias rápidas recomendadas:</span>
                  {BADGE_PRESETS.map(badge => (
                    <button
                      key={badge}
                      type="button"
                      className="badge-preset-btn"
                      onClick={() => setEditingProduct({ ...editingProduct, badge })}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECCIÓN 2: Precios, Descuentos y Entrega */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>💰</span> 2. Precios, Descuentos y Tiempos de Entrega
                </h4>

                <div className="form-grid-3">
                  <div className="mercado-input-group">
                    <label>Precio de Venta (Q) *</label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Precio Regular Tachado (Q)</label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={editingProduct.originalPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="Opcional para mostrar rebaja"
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Tiempo de Entrega</label>
                    <input
                      type="text"
                      value={editingProduct.deliveryTime || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, deliveryTime: e.target.value })}
                      placeholder="Ej: Entrega 24-48 hrs"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={editingProduct.inStock ?? true}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    />
                    <span>🟢 Producto Disponible en Inventario (En Stock)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={editingProduct.featured ?? false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    />
                    <span>⭐ Destacar en primera fila del catálogo</span>
                  </label>
                </div>
              </div>

              {/* SECCIÓN 3: Aspecto Visual e Imagen de Portada */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>🎨</span> 3. Icono Emoji y Foto de Portada
                </h4>

                <div className="form-grid-2">
                  <div className="mercado-input-group">
                    <label>Icono Emoji Representativo</label>
                    <input
                      type="text"
                      value={editingProduct.icon}
                      onChange={(e) => setEditingProduct({ ...editingProduct, icon: e.target.value })}
                      style={{ fontSize: '1.4rem' }}
                    />
                    <div className="emoji-quick-picker">
                      {POPULAR_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          className="emoji-quick-btn"
                          onClick={() => setEditingProduct({ ...editingProduct, icon: emoji })}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mercado-input-group">
                    <label>URL de Foto de Portada (o subir archivo)</label>
                    <input
                      type="text"
                      value={editingProduct.image || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="https://... o sube una imagen abajo"
                    />

                    <label className="image-upload-dropzone">
                      {editingProduct.image ? (
                        <img src={editingProduct.image} alt="Portada" className="dropzone-preview" />
                      ) : (
                        <span style={{ fontSize: '2rem' }}>📷</span>
                      )}
                      <div>
                        <strong style={{ display: 'block', color: '#ffffff', fontSize: '0.84rem' }}>
                          Subir foto desde la computadora
                        </strong>
                        <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                          Se comprime automáticamente a formato WebP liviano
                        </span>
                      </div>
                      <input 
                        ref={modalFileInputRef}
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={handleModalImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: Social Proof y Reseñas */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>⭐</span> 4. Calificaciones y Métricas Sociales
                </h4>

                <div className="form-grid-3">
                  <div className="mercado-input-group">
                    <label>Puntuación de Estrellas (1.0 a 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={editingProduct.rating}
                      onChange={(e) => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) || 5.0 })}
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Número de Reseñas / Calificaciones</label>
                    <input
                      type="number"
                      min="1"
                      value={editingProduct.reviewsCount}
                      onChange={(e) => setEditingProduct({ ...editingProduct, reviewsCount: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Unidades Vendidas Estimadas</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.soldCount || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, soldCount: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 5: Descripciones y Ficha Pedagógica */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>📝</span> 5. Descripciones y Contenidos del Paquete
                </h4>

                <div className="mercado-input-group">
                  <label>Descripción Breve (Resumen para la Tarjeta de Catálogo)</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Resumen de 1-2 líneas que destaca el valor pedagógico principal..."
                  />
                </div>

                <div className="mercado-input-group">
                  <label>Descripción Detallada (Ficha Pedagógica en Modal)</label>
                  <textarea
                    rows={4}
                    value={editingProduct.longDescription}
                    onChange={(e) => setEditingProduct({ ...editingProduct, longDescription: e.target.value })}
                    placeholder="Explicación completa de las metodologías, competencias y enfoque pedagógico..."
                  />
                </div>

                {/* Lista Dinámica de Características */}
                <div className="mercado-input-group">
                  <label>Características y Competencias Clave</label>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 12px 0' }}>
                    Aspectos pedagógicos, habilidades y competencias que desarrolla el libro o material. Se mostrarán con distintivos de colores armónicos.
                  </p>
                  <div className="collection-features-editor">
                    {(editingProduct.features || []).map((feat, fIdx) => {
                      const colorStyles = [
                        { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
                        { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
                        { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
                        { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
                        { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
                        { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' }
                      ];
                      const activeColor = colorStyles[fIdx % colorStyles.length];

                      return (
                        <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span 
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '8px', 
                              background: activeColor.bg, 
                              border: `1px solid ${activeColor.border}`, 
                              color: activeColor.color, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontWeight: 800, 
                              fontSize: '0.8rem',
                              flexShrink: 0
                            }}
                          >
                            {fIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const nextFeats = [...editingProduct.features];
                              nextFeats[fIdx] = e.target.value;
                              setEditingProduct({ ...editingProduct, features: nextFeats });
                            }}
                            placeholder="Ej: Actividades de comprensión lectora y competencias STEAM..."
                            style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.86rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextFeats = editingProduct.features.filter((_, i) => i !== fIdx);
                              setEditingProduct({ ...editingProduct, features: nextFeats });
                            }}
                            title="Quitar característica"
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      className="btn-add-item"
                      onClick={() => {
                        setEditingProduct({
                          ...editingProduct,
                          features: [...(editingProduct.features || []), '']
                        });
                      }}
                    >
                      ＋ Agregar Otra Característica
                    </button>
                  </div>
                </div>

                {/* Lista Dinámica de Contenidos del Paquete */}
                <div className="mercado-input-group">
                  <label>Contenido del Paquete / Set Incluido</label>
                  <div className="dynamic-items-list">
                    {(editingProduct.contents || []).map((item, cIdx) => (
                      <div key={cIdx} className="dynamic-item-row">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const nextContents = [...(editingProduct.contents || [])];
                            nextContents[cIdx] = e.target.value;
                            setEditingProduct({ ...editingProduct, contents: nextContents });
                          }}
                          placeholder="Ej: 1 Libro impreso de 64 páginas a color..."
                        />
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => {
                            const nextContents = (editingProduct.contents || []).filter((_, i) => i !== cIdx);
                            setEditingProduct({ ...editingProduct, contents: nextContents });
                          }}
                          title="Quitar item"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn-add-item"
                      onClick={() => {
                        setEditingProduct({
                          ...editingProduct,
                          contents: [...(editingProduct.contents || []), '']
                        });
                      }}
                    >
                      ＋ Agregar Item a la Caja
                    </button>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 6: Formato Literario & Colección Kindle (Editorial) */}
              {editingProduct.category === 'cuentos' && (
                <div className="modal-section-box">
                  <h4 className="modal-section-title">
                    <span>📖</span> 6. Datos Editoriales & Colección Kindle
                  </h4>

                  <div className="form-grid-3">
                    <div className="mercado-input-group">
                      <label>Autor / Ilustrador</label>
                      <input
                        type="text"
                        value={editingProduct.author || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, author: e.target.value })}
                        placeholder="Ej: Editorial Lluvia de Ideas"
                      />
                    </div>

                    <div className="mercado-input-group">
                      <label>Número de Páginas</label>
                      <input
                        type="number"
                        min="1"
                        value={editingProduct.pages || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, pages: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                        placeholder="Ej: 64"
                      />
                    </div>

                    <div className="mercado-input-group">
                      <label>Formato de Impresión / Digital</label>
                      <input
                        type="text"
                        value={editingProduct.formatType || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, formatType: e.target.value })}
                        placeholder="Ej: Kindle eBook & Tapa Dura"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3" style={{ marginTop: '14px' }}>
                    <div className="mercado-input-group">
                      <label>Colección Literaria Asociada</label>
                      <select
                        value={editingProduct.collectionId || ''}
                        onChange={(e) => {
                          const colId = e.target.value;
                          let colName = '';
                          if (colId === 'col-popol-vuh') colName = 'Saga Mítica Popol Vuh: Dioses & Creación';
                          else if (colId === 'col-steam') colName = 'Colección STEAM: Sabiduría Ancestral';
                          else if (colId === 'col-magna') colName = 'Gran Biblioteca Escolar: Antología Completa';
                          setEditingProduct({
                            ...editingProduct,
                            collectionId: colId || undefined,
                            collectionName: colName || undefined
                          });
                        }}
                      >
                        <option value="">Sin Colección (Título Individual)</option>
                        <option value="col-popol-vuh">🏛️ Saga Mítica Popol Vuh (5 Libros)</option>
                        <option value="col-steam">🚀 Colección STEAM (4 Libros)</option>
                        <option value="col-magna">📦 Gran Biblioteca Escolar (9 Libros)</option>
                      </select>
                    </div>

                    <div className="mercado-input-group">
                      <label>Código ISBN (Opcional)</label>
                      <input
                        type="text"
                        value={editingProduct.isbn || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isbn: e.target.value })}
                        placeholder="Ej: 978-99939-0-123-4"
                      />
                    </div>

                    <div className="mercado-input-group">
                      <label>Paleta de Portada Kindle 3D</label>
                      <select
                        value={editingProduct.coverTheme || 'amber'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, coverTheme: e.target.value as any })}
                      >
                        <option value="amber">🟠 Ámbar Dorado Maya (Cálido)</option>
                        <option value="cyan">🔵 Cian Cósmico (Profundo)</option>
                        <option value="emerald">🟢 Esmeralda Selva (Naturaleza)</option>
                        <option value="purple">🟣 Púrpura Místico (Épico)</option>
                        <option value="ruby">🔴 Rubí Ancestral (Intenso)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="admin-modal-footer">
              <button 
                type="button" 
                className="btn-mercado-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-mercado-primary"
                onClick={handleSaveProduct}
              >
                💾 Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL DE CONFIGURACIÓN DE COLECCIÓN / PACK (5 LIBROS)
          ============================================================== */}
      {isCollectionModalOpen && editingCollection && (
        <div className="admin-modal-overlay animate-fade-in" onClick={() => setIsCollectionModalOpen(false)}>
          <div 
            className="admin-mercado-modal animate-scale-up" 
            style={{ maxWidth: '880px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="admin-modal-header">
              <h3>
                <span>📦</span>
                {editingCollection.id.startsWith('col-') && !collections.some(c => c.id === editingCollection.id)
                  ? 'Nueva Colección / Pack de Libros'
                  : `Editar: ${editingCollection.title || 'Colección'}`}
              </h3>
              <button 
                type="button" 
                className="admin-modal-close" 
                onClick={() => setIsCollectionModalOpen(false)}
                title="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo del formulario de colección */}
            <div className="admin-modal-body-scroll">
              {/* SECCIÓN 1: Datos Generales de la Colección */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>📖</span> 1. Información General del Pack
                </h4>

                <div className="form-grid-2">
                  <div className="mercado-input-group">
                    <label>Título de la Colección *</label>
                    <input
                      type="text"
                      value={editingCollection.title}
                      onChange={(e) => setEditingCollection({ ...editingCollection, title: e.target.value })}
                      placeholder="Ej: Saga Mítica Popol Vuh: Dioses & Creación"
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Subtítulo o Resumen del Set</label>
                    <input
                      type="text"
                      value={editingCollection.subtitle || ''}
                      onChange={(e) => setEditingCollection({ ...editingCollection, subtitle: e.target.value })}
                      placeholder="Ej: Colección de 5 Obras Maestras Ilustradas"
                    />
                  </div>
                </div>

                <div className="form-grid-3" style={{ marginTop: '12px' }}>
                  <div className="mercado-input-group">
                    <label>Insignia Destacada (Badge)</label>
                    <input
                      type="text"
                      value={editingCollection.badge || ''}
                      onChange={(e) => setEditingCollection({ ...editingCollection, badge: e.target.value })}
                      placeholder="Ej: PACK COLECCIÓN COMPLETA"
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Grado Escolar o Rango de Edad</label>
                    <input
                      type="text"
                      value={editingCollection.gradeOrAge || ''}
                      onChange={(e) => setEditingCollection({ ...editingCollection, gradeOrAge: e.target.value })}
                      placeholder="Ej: Primaria & Ciclo Básico (8 a 15 años)"
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Moneda</label>
                    <input
                      type="text"
                      value={editingCollection.currency || 'Q'}
                      onChange={(e) => setEditingCollection({ ...editingCollection, currency: e.target.value })}
                      placeholder="Q"
                    />
                  </div>
                </div>

                <div className="mercado-input-group" style={{ marginTop: '12px' }}>
                  <label>Descripción General de la Saga</label>
                  <textarea
                    rows={3}
                    value={editingCollection.description || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                    placeholder="Describe el valor pedagógico, literario o artístico de la colección completa..."
                  />
                </div>
              </div>

              {/* SECCIÓN 2: Precios y Regla de Venta Exclusiva */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>💰</span> 2. Precio del Pack y Modalidad de Venta
                </h4>

                <div className="form-grid-2">
                  <div className="mercado-input-group">
                    <label>Precio del Pack Completo ({editingCollection.currency}) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingCollection.price}
                      onChange={(e) => setEditingCollection({ ...editingCollection, price: parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: 440.00"
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Precio Regular / Anterior (Tachado)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingCollection.originalPrice || ''}
                      onChange={(e) => setEditingCollection({ ...editingCollection, originalPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: 550.00 (opcional)"
                    />
                    {editingCollection.originalPrice > editingCollection.price && (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                        ✓ Ahorro de {editingCollection.currency} {(editingCollection.originalPrice - editingCollection.price).toFixed(2)} para el cliente
                      </span>
                    )}
                  </div>
                </div>

                {/* CONFIGURACIÓN CLAVE: MODALIDAD DE VENTA DE LA COLECCIÓN */}
                <div className="collection-sale-mode-selector" style={{ marginTop: '14px', marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                    Modalidad de Venta para los Libros de esta Colección *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    <div 
                      onClick={() => setEditingCollection({ ...editingCollection, onlySoldAsPack: true })}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: editingCollection.onlySoldAsPack !== false ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: editingCollection.onlySoldAsPack !== false ? '#f0f9ff' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                        <strong style={{ fontSize: '0.86rem', color: editingCollection.onlySoldAsPack !== false ? '#0369a1' : '#0f172a' }}>
                          Venta Exclusiva en Colección (Pack)
                        </strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                        Los libros <strong>NO se venden por separado</strong>. En la tienda los clientes podrán ver las portadas 3D y sinopsis de cada título, pero desaparece la opción de agregarlos al carrito individualmente; solo pueden llevar la colección completa.
                      </p>
                    </div>

                    <div 
                      onClick={() => setEditingCollection({ ...editingCollection, onlySoldAsPack: false })}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: editingCollection.onlySoldAsPack === false ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: editingCollection.onlySoldAsPack === false ? '#f0f9ff' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔓</span>
                        <strong style={{ fontSize: '0.86rem', color: editingCollection.onlySoldAsPack === false ? '#0369a1' : '#0f172a' }}>
                          Venta Mixta (Pack o Por Separado)
                        </strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                        Los clientes pueden comprar el pack completo con descuento o adquirir cualquiera de los libros de forma individual por separado en el carrito.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="mercado-input-group">
                    <label>URL Portada Principal del Pack / Caja (Opcional)</label>
                    <input
                      type="text"
                      value={editingCollection.image || ''}
                      onChange={(e) => setEditingCollection({ ...editingCollection, image: e.target.value })}
                      placeholder="https://... o sube la imagen abajo"
                    />
                    <label className="image-upload-dropzone" style={{ marginTop: '8px', padding: '12px' }}>
                      {editingCollection.image ? (
                        <img src={editingCollection.image} alt="Caja Pack" className="dropzone-preview" style={{ width: '48px', height: '48px' }} />
                      ) : (
                        <span style={{ fontSize: '1.5rem' }}>📷</span>
                      )}
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: '#fff' }}>Subir imagen de la caja / pack</strong>
                        <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>Formato PNG o WebP</span>
                      </div>
                      <input
                        ref={colCoverInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleColCoverUpload}
                      />
                    </label>
                  </div>

                  <div className="mercado-input-group">
                    <label>Sincronización en Catálogo</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <input
                        type="checkbox"
                        checked={syncCollectionAsProduct}
                        onChange={(e) => setSyncCollectionAsProduct(e.target.checked)}
                      />
                      <span>Mostrar también como producto destacado en la tienda principal</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: Gestor de los Libros que Componen la Colección */}
              <div className="modal-section-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h4 className="modal-section-title" style={{ margin: 0 }}>
                    <span>📚</span> 3. Libros Incluidos en la Colección ({editingCollection.includedBooks?.length || 0} Títulos)
                  </h4>
                  <button
                    type="button"
                    className="btn-mercado-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={handleAddBookToCollection}
                  >
                    ＋ Agregar Otro Libro al Pack
                  </button>
                </div>

                <div className="included-books-editor">
                  {editingCollection.includedBooks?.map((book, idx) => (
                    <div key={book.id || idx} className="included-book-card">
                      <div className="included-book-header">
                        <span className="included-book-num">
                          📖 Tomo #{idx + 1}
                        </span>
                        {editingCollection.includedBooks!.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-book"
                            onClick={() => handleRemoveBookFromCollection(idx)}
                            title="Quitar este libro de la colección"
                          >
                            ✕ Quitar Libro
                          </button>
                        )}
                      </div>

                      <div className="included-book-fields-row">
                        <div className="included-book-cover-picker">
                          <div className="included-book-thumb-box">
                            {book.image ? (
                              <img src={book.image} alt={book.title || `Libro ${idx + 1}`} />
                            ) : (
                              <span>📖</span>
                            )}
                          </div>
                          <label className="btn-upload-book-cover">
                            {uploadingBookCoverIdx === idx ? 'Subiendo...' : '📷 Portada'}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleBookCoverUpload(e, idx)}
                            />
                          </label>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div className="form-grid-2">
                            <div className="mercado-input-group">
                              <label>Título del Libro *</label>
                              <input
                                type="text"
                                value={book.title}
                                onChange={(e) => handleUpdateIncludedBook(idx, 'title', e.target.value)}
                                placeholder={`Ej: Libro ${idx + 1} de la Saga`}
                              />
                            </div>

                            <div className="mercado-input-group">
                              <label>Autor / Adaptador</label>
                              <input
                                type="text"
                                value={book.author || ''}
                                onChange={(e) => handleUpdateIncludedBook(idx, 'author', e.target.value)}
                                placeholder="Editorial Lluvia de Ideas"
                              />
                            </div>
                          </div>

                          <div className="form-grid-3">
                            <div className="mercado-input-group">
                              <label>Páginas</label>
                              <input
                                type="number"
                                min="1"
                                value={book.pages || ''}
                                onChange={(e) => handleUpdateIncludedBook(idx, 'pages', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                placeholder="Ej: 48"
                              />
                            </div>

                            <div className="mercado-input-group">
                              <label>Tema de Portada 3D</label>
                              <select
                                value={book.coverTheme || 'amber'}
                                onChange={(e) => handleUpdateIncludedBook(idx, 'coverTheme', e.target.value)}
                              >
                                <option value="amber">🟠 Ámbar</option>
                                <option value="cyan">🔵 Cian</option>
                                <option value="emerald">🟢 Esmeralda</option>
                                <option value="purple">🟣 Púrpura</option>
                                <option value="ruby">🔴 Rubí</option>
                              </select>
                            </div>

                            <div className="mercado-input-group">
                              <label>URL Portada (Opcional)</label>
                              <input
                                type="text"
                                value={book.image || ''}
                                onChange={(e) => handleUpdateIncludedBook(idx, 'image', e.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          <div className="mercado-input-group">
                            <label>Sinopsis / Argumento Breve</label>
                            <textarea
                              rows={2}
                              value={book.description || ''}
                              onChange={(e) => handleUpdateIncludedBook(idx, 'description', e.target.value)}
                              placeholder="Breve resumen del libro para la ficha técnica..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN 4: Características y Beneficios del Pack */}
              <div className="modal-section-box">
                <h4 className="modal-section-title">
                  <span>✨</span> 4. Beneficios y Características de la Colección
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 12px 0' }}>
                  Elementos descriptivos que destacan la colección (ej: 5 libros en pasta dura, glosario, caja conmemorativa). Cada uno se mostrará con un chip de color distintivo en la tienda.
                </p>

                <div className="collection-features-editor">
                  {(editingCollection.features || []).map((feat, fIdx) => {
                    const colorStyles = [
                      { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
                      { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
                      { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
                      { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
                      { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
                      { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' }
                    ];
                    const activeColor = colorStyles[fIdx % colorStyles.length];

                    return (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span 
                          style={{ 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '8px', 
                            background: activeColor.bg, 
                            border: `1px solid ${activeColor.border}`, 
                            color: activeColor.color, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 800, 
                            fontSize: '0.8rem',
                            flexShrink: 0
                          }}
                        >
                          {fIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const nextFeats = [...(editingCollection.features || [])];
                            nextFeats[fIdx] = e.target.value;
                            setEditingCollection({ ...editingCollection, features: nextFeats });
                          }}
                          placeholder="Ej: 5 Libros en pasta dura a todo color..."
                          style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.86rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextFeats = (editingCollection.features || []).filter((_, i) => i !== fIdx);
                            setEditingCollection({ ...editingCollection, features: nextFeats });
                          }}
                          title="Eliminar característica"
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  <div style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCollection({
                          ...editingCollection,
                          features: [...(editingCollection.features || []), '']
                        });
                      }}
                      style={{ background: '#f8fafc', border: '1px dashed #94a3b8', color: '#0f172a', fontWeight: 700, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '0.86rem' }}
                    >
                      ＋ Agregar Otra Característica
                    </button>
                  </div>

                  {/* Sugerencias Rápidas / Presets con 1 Clic */}
                  <div style={{ marginTop: '14px', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 750, color: '#475569', display: 'block', marginBottom: '8px' }}>
                      💡 Sugerencias descriptivas (haz clic para agregar al instante):
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        '5 Libros en pasta dura a todo color',
                        'Caja conmemorativa de colección',
                        'Glosario pedagógico y mapa cosmológico desplegable',
                        'Guías pedagógicas transversales de literatura y cosmovisión',
                        'Edición especial de lujo con encuadernación cosida'
                      ].map((sug, sIdx) => {
                        const isAdded = (editingCollection.features || []).includes(sug);
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              if (!isAdded) {
                                setEditingCollection({
                                  ...editingCollection,
                                  features: [...(editingCollection.features || []).filter(f => f.trim().length > 0), sug]
                                });
                              }
                            }}
                            disabled={isAdded}
                            style={{
                              background: isAdded ? '#f1f5f9' : '#ffffff',
                              border: isAdded ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                              color: isAdded ? '#94a3b8' : '#0369a1',
                              padding: '5px 10px',
                              borderRadius: '20px',
                              fontSize: '0.76rem',
                              fontWeight: 650,
                              cursor: isAdded ? 'default' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {isAdded ? '✓ Incluido' : `＋ ${sug}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="admin-modal-footer">
              <button 
                type="button" 
                className="btn-mercado-secondary"
                onClick={() => setIsCollectionModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-mercado-primary"
                onClick={handleSaveCollection}
              >
                💾 Guardar Colección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL DE CREAR / EDITAR DEPARTAMENTO */}
      {isDepartmentModalOpen && editingDepartment && (
        <div className="admin-modal-backdrop animate-fade-in" onClick={() => setIsDepartmentModalOpen(false)}>
          <div className="admin-modal-card card-glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title-wrap">
                <span className="modal-title-icon">{editingDepartment.icon || '🗂️'}</span>
                <div>
                  <h3 className="admin-modal-title">
                    {originalDepartmentId ? 'Editar Departamento' : 'Nuevo Departamento / Categoría'}
                  </h3>
                  <span className="admin-modal-subtitle">
                    Configura el nombre, emoji identificador y descripción pedagógica
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-modal-close"
                onClick={() => setIsDepartmentModalOpen(false)}
                title="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDepartment}>
              <div className="admin-modal-body-scroll" style={{ maxHeight: '70vh' }}>
                <div className="modal-section-box">
                  <h4 className="modal-section-title">
                    <span>🎨</span> Icono / Emoji Representativo
                  </h4>

                  <div className="admin-emoji-picker-container">
                    <div className="form-grid-2">
                      <div className="mercado-input-group">
                        <label>Emoji seleccionado</label>
                        <input
                          type="text"
                          value={editingDepartment.icon}
                          onChange={(e) => setEditingDepartment({ ...editingDepartment, icon: e.target.value })}
                          placeholder="Ej: 📚"
                          style={{ fontSize: '1.4rem', textAlign: 'center', fontWeight: 'bold' }}
                          maxLength={4}
                          required
                        />
                      </div>
                      <div className="mercado-input-group">
                        <label>Vista previa visual</label>
                        <div style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '1.6rem' }}>{editingDepartment.icon || '📦'}</span>
                          <span style={{ color: '#ffffff', fontWeight: 750, fontSize: '0.95rem' }}>
                            {editingDepartment.label || 'Nombre del Departamento'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
                      O elige uno de los iconos sugeridos:
                    </label>
                    <div className="admin-emoji-preset-grid">
                      {['📚', '📖', '🎲', '♟️', '🎭', '🎴', '🚀', '🔬', '🎨', '🤖', '🧩', '🎵', '📐', '💻', '🎒', '🌿', '🧪', '🧬', '⚡', '🪐', '👑', '🦖', '🏺', '📝', '🧸', '🔍', '⭐', '🥇'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          className={`admin-emoji-preset-btn ${editingDepartment.icon === emoji ? 'active' : ''}`}
                          onClick={() => setEditingDepartment({ ...editingDepartment, icon: emoji })}
                          title={`Elegir ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal-section-box">
                  <h4 className="modal-section-title">
                    <span>🏷️</span> Información y Nomenclatura
                  </h4>

                  <div className="mercado-input-group">
                    <label>Nombre del Departamento / Categoría *</label>
                    <input
                      type="text"
                      value={editingDepartment.label}
                      onChange={(e) => {
                        const newLabel = e.target.value;
                        const update: Partial<MercadoCategory> = { label: newLabel };
                        if (!originalDepartmentId) {
                          update.id = newLabel
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]/g, "-")
                            .replace(/-+/g, "-");
                        }
                        setEditingDepartment({ ...editingDepartment, ...update });
                      }}
                      placeholder="Ej: Robótica Educativa & Programación"
                      required
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>
                      Identificador Técnico (Slug) *
                      <small style={{ color: '#94a3b8', marginLeft: '6px', fontWeight: 400 }}>
                        (Se usa para filtrados URL y relaciones de productos)
                      </small>
                    </label>
                    <input
                      type="text"
                      value={editingDepartment.id}
                      onChange={(e) => setEditingDepartment({ ...editingDepartment, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                      placeholder="Ej: robotica-educativa"
                      required
                    />
                  </div>

                  <div className="mercado-input-group">
                    <label>Descripción Pedagógica (Opcional)</label>
                    <textarea
                      rows={2}
                      value={editingDepartment.description || ''}
                      onChange={(e) => setEditingDepartment({ ...editingDepartment, description: e.target.value })}
                      placeholder="Breve explicación de los materiales que integran este departamento..."
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn-mercado-secondary"
                  onClick={() => setIsDepartmentModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-mercado-primary"
                >
                  💾 Guardar Departamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL DE CONFIRMACIÓN / REASIGNACIÓN AL ELIMINAR DEPARTAMENTO */}
      {departmentToDelete && (
        <div className="admin-modal-backdrop animate-fade-in" onClick={() => setDepartmentToDelete(null)}>
          <div className="admin-modal-card card-glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <div className="admin-modal-title-wrap">
                <span className="modal-title-icon">🗑️</span>
                <div>
                  <h3 className="admin-modal-title">Eliminar Departamento</h3>
                  <span className="admin-modal-subtitle">
                    {departmentToDelete.icon} {departmentToDelete.label}
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-modal-close"
                onClick={() => setDepartmentToDelete(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                const assignedCount = products.filter(p => p.category === departmentToDelete.id).length;
                const otherDepartments = departments.filter(d => d.id !== departmentToDelete.id);

                if (assignedCount > 0) {
                  return (
                    <div className="admin-delete-reassign-box">
                      <strong>⚠️ Este departamento tiene {assignedCount} producto(s) asociado(s)</strong>
                      <p>
                        Para evitar que los productos queden sin departamento en tu tienda, selecciona a qué categoría deseas reasignarlos:
                      </p>

                      {otherDepartments.length > 0 && (
                        <div className="mercado-input-group" style={{ marginTop: '4px' }}>
                          <label style={{ color: '#ffffff', fontWeight: 700 }}>Reasignar productos a:</label>
                          <select
                            value={reassignCategoryTo}
                            onChange={(e) => setReassignCategoryTo(e.target.value)}
                            style={{ background: '#0f172a', color: '#ffffff' }}
                          >
                            {otherDepartments.map(d => (
                              <option key={d.id} value={d.id}>
                                {d.icon} {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {otherDepartments.length > 0 && (
                          <button
                            type="button"
                            className="btn-mercado-primary"
                            onClick={() => handleConfirmDeleteDepartment(true)}
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                          >
                            ✓ Reasignar {assignedCount} productos y Eliminar
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-mercado-clear"
                          onClick={() => handleConfirmDeleteDepartment(false)}
                        >
                          Eliminar de todos modos (sin reasignar)
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                      ¿Confirmas que deseas eliminar el departamento <strong>"{departmentToDelete.label}"</strong>? Esta categoría ya no aparecerá en el menú vertical ni en los filtros del Mercado.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn-mercado-secondary"
                        onClick={() => setDepartmentToDelete(null)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn-mercado-clear"
                        onClick={() => handleConfirmDeleteDepartment(false)}
                      >
                        🗑️ Sí, Eliminar Departamento
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Notificación Toast de Sincronización Inmediata */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.45)',
          fontWeight: 750,
          fontSize: '0.92rem',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>☁️</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
