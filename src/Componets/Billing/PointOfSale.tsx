import {
  Box, Typography, Button, IconButton, Stack, Grid as Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Checkbox, FormControlLabel, TextField, Chip, Switch, Tabs, Tab
} from '@mui/material';
import { X, Printer } from 'lucide-react';
import '../POS.css';
import { AppHeader } from '../Header';
import { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';

declare global {
  interface Window {
    BluetoothDevice: any;
  }
}

interface POSItem {
  productId: string;
  productName: string;
  subDetail?: string;
  quantity: number;
  price: number;
  total: number;
  unit?: string;
}

type Unit = 'kg' | 'pcs' | 'pkt' | 'g';
interface Product {
  id: string;
  name: string;
  defaultPrice: number;
  category: 'Vegetables' | 'Fruits' | 'Grocery';
  unit: Unit;
  image: string;
}

const INITIAL_PRODUCTS: Product[] = [
  // --- ALL VEGETABLES ---
  { id: 'veg_1', name: 'Tomato 1kg', defaultPrice: 40, category: 'Vegetables', unit: 'kg', image: '/tomato.jpg' },
  { id: 'veg_2', name: 'Onion 1kg', defaultPrice: 35, category: 'Vegetables', unit: 'kg', image: '/onion.jpg' },
  { id: 'veg_3', name: 'Potato 1kg', defaultPrice: 30, category: 'Vegetables', unit: 'kg', image: '/potato.jpg' },
  { id: 'veg_4', name: 'Carrot 1kg', defaultPrice: 60, category: 'Vegetables', unit: 'kg', image: '/carrot.avif' },
  { id: 'veg_5', name: 'Beans 1kg', defaultPrice: 70, category: 'Vegetables', unit: 'kg', image: '/beans.jpg' },
  { id: 'veg_6', name: 'Cabbage 1pc', defaultPrice: 25, category: 'Vegetables', unit: 'pcs', image: '/cabbage.jpg' },
  { id: 'veg_7', name: 'Cauliflower 1pc', defaultPrice: 35, category: 'Vegetables', unit: 'pcs', image: '/cauliflower.jpg' },
  { id: 'veg_8', name: 'Green Chilli 250g', defaultPrice: 20, category: 'Vegetables', unit: 'pkt', image: '/chilli.jpg' },
  { id: 'veg_9', name: 'Lemon 10pcs', defaultPrice: 30, category: 'Vegetables', unit: 'pkt', image: '/lemon.jpg' },
  { id: 'veg_10', name: 'Brinjal 1kg', defaultPrice: 45, category: 'Vegetables', unit: 'kg', image: '/brinjal.jpg' },
  { id: 'veg_11', name: 'Ladies Finger 1kg', defaultPrice: 40, category: 'Vegetables', unit: 'kg', image: '/ladiesfinger.jpg' },
  { id: 'veg_12', name: 'Beetroot 1kg', defaultPrice: 50, category: 'Vegetables', unit: 'kg', image: '/beetroot.jpg' },
  { id: 'veg_13', name: 'Capsicum 1kg', defaultPrice: 65, category: 'Vegetables', unit: 'kg', image: '/capsicum.jpg' },
  { id: 'veg_14', name: 'Bitter Gourd 1kg', defaultPrice: 50, category: 'Vegetables', unit: 'kg', image: '/bittergourd.jpg' },
  { id: 'veg_15', name: 'Bottle Gourd 1pc', defaultPrice: 30, category: 'Vegetables', unit: 'pcs', image: '/bottlegourd.jpg' },
  { id: 'veg_16', name: 'Drumstick 1pkt', defaultPrice: 25, category: 'Vegetables', unit: 'pkt', image: '/drumstick.jpg' },
  { id: 'veg_17', name: 'Curry Leaves 1pkt', defaultPrice: 10, category: 'Vegetables', unit: 'pkt', image: '/curryleaves.jpg' },
  { id: 'veg_18', name: 'Coriander Leaves 1pkt', defaultPrice: 10, category: 'Vegetables', unit: 'pkt', image: '/coriander.avif' },

  // --- ALL FRUITS ---
  { id: 'fru_1', name: 'Apple 1kg', defaultPrice: 160, category: 'Fruits', unit: 'kg', image: '/apple.webp' },
  { id: 'fru_2', name: 'Banana 1 Dozen', defaultPrice: 60, category: 'Fruits', unit: 'pkt', image: '/banana.jpg' },
  { id: 'fru_3', name: 'Pomegranate 1kg', defaultPrice: 180, category: 'Fruits', unit: 'kg', image: '/pomegranate.jpg' },
  { id: 'fru_4', name: 'Grapes 1kg', defaultPrice: 90, category: 'Fruits', unit: 'kg', image: '/grapes.jfif' },
  { id: 'fru_5', name: 'Mango 1kg', defaultPrice: 120, category: 'Fruits', unit: 'kg', image: '/mango.jpg' },
  { id: 'fru_6', name: 'Orange 1kg', defaultPrice: 80, category: 'Fruits', unit: 'kg', image: '/orange.jfif' },
  { id: 'fru_7', name: 'Papaya 1pc', defaultPrice: 50, category: 'Fruits', unit: 'pcs', image: '/papaya.jpg' },
  { id: 'fru_8', name: 'Watermelon 1pc', defaultPrice: 70, category: 'Fruits', unit: 'pcs', image: '/watermelon.jpg' },
  { id: 'fru_9', name: 'Pineapple 1pc', defaultPrice: 60, category: 'Fruits', unit: 'pcs', image: '/pineapple.webp' },
  { id: 'fru_10', name: 'Muskmelon 1pc', defaultPrice: 50, category: 'Fruits', unit: 'pcs', image: '/muskmelon.jpg' },

  // --- GROCERY ---
  { id: 'g_1', name: 'Basmati Rice 1kg', defaultPrice: 120, category: 'Grocery', unit: 'kg', image: '/rice.jpg' },
  { id: 'g_2', name: 'Toor Dal 1kg', defaultPrice: 140, category: 'Grocery', unit: 'kg', image: '/dal.png' },
  { id: 'g_3', name: 'Sunflower Oil 1L', defaultPrice: 130, category: 'Grocery', unit: 'pcs', image: '/oil.png' },
  { id: 'g_4', name: 'Sugar 1kg', defaultPrice: 45, category: 'Grocery', unit: 'kg', image: '/sugar.png' },
];

let cachedDevice: any = null;

export function PointOfSale() {
  const cartEndRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<POSItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'SCANNER'>('CASH');
  const [discount, setDiscount] = useState(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Vegetables' | 'Fruits' | 'Grocery'>('Vegetables');

  // Pop-up Flow States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [step, setStep] = useState<'QTY' | 'RATE'>('QTY');
  const [tempQty, setTempQty] = useState<string>('1');
  const [tempRate, setTempRate] = useState<string>('0');
  const [showModal, setShowModal] = useState(false);

  const [focusId, setFocusId] = useState<string | null>(null);
  const rateInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [productsList] = useState<Product[]>(INITIAL_PRODUCTS);

  // Customer & GST States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGst, setCustomerGst] = useState('');
  const [gstEnabled, setGstEnabled] = useState(false);

  const [billNo, setBillNo] = useState(() => {
    const saved = localStorage.getItem('lastBillNo');
    return saved ? parseInt(saved, 10) : 1;
  });

  useEffect(() => {
    const saved = localStorage.getItem('pos-cart');
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pos-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('lastBillNo', billNo.toString());
  }, [billNo]);

  useEffect(() => {
    if (cart.length > 0) {
      cartEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [cart]);

  useEffect(() => {
    if (focusId && rateInputRefs.current[focusId]) {
      rateInputRefs.current[focusId]?.focus();
      rateInputRefs.current[focusId]?.select();
      setFocusId(null);
    }
  }, [focusId, cart]);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalQty = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);

  const cgstAmount = gstEnabled ? discountedSubtotal * 0.025 : 0;
  const sgstAmount = gstEnabled ? discountedSubtotal * 0.025 : 0;
  const finalTotal = Math.round(discountedSubtotal + cgstAmount + sgstAmount);
  const noOfItems = cart.length;

  const handleTileClick = (product: Product) => {
    setSelectedProduct(product);
    setTempQty('1');
    setTempRate(product.defaultPrice.toString());
    setStep('QTY');
    setShowModal(true);
  };

  const handleQtySubmit = () => {
    if (!tempQty || Number(tempQty) <= 0) {
      alert("Please enter a valid quantity!");
      return;
    }
    setStep('RATE');
  };

  const handleRateSubmit = () => {
    if (!selectedProduct) return;
    const qty = parseFloat(tempQty) || 1;
    const price = parseFloat(tempRate) || 0;
    const newId = `${selectedProduct.id}_${Date.now()}`;

    setCart(prev => [
      ...prev,
      {
        productId: newId,
        productName: selectedProduct.name,
        quantity: qty,
        price: price,
        total: qty * price,
        unit: selectedProduct.unit
      }
    ]);

    setShowModal(false);
    setSelectedProduct(null);
    setFocusId(newId);
  };

  const handleDirectCustomClick = () => {
    const newId = `custom_${Date.now()}`;
    setCart(prev => [...prev, {
      productId: newId,
      productName: 'General Item',
      quantity: 1,
      price: 0,
      total: 0,
      unit: 'pcs'
    }]);
    setFocusId(newId);
  };

  const updateCartItemName = (id: string, newName: string) => {
    setCart(prev => prev.map(item => item.productId === id ? { ...item, productName: newName } : item));
  };

  const updateCartItemRate = (id: string, newRate: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const rate = isNaN(newRate) ? 0 : newRate;
        return { ...item, price: rate, total: rate * item.quantity };
      }
      return item;
    }));
  };

  const updateCartItemQty = (id: string, newQty: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const qty = isNaN(newQty) ? 0 : newQty;
        return { ...item, quantity: qty, total: item.price * qty };
      }
      return item;
    }));
  };

  const filteredProducts = productsList.filter(p => p.category === selectedTab);

  const getImageBytes = async (url: string, printWidth: number = 200): Promise<Uint8Array | null> => {
    try {
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      const width = printWidth;
      const height = Math.floor(img.height * (width / img.width));
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const { data } = imageData;
      const printData: number[] = [];
      printData.push(0x1d, 0x76, 0x30, 0, Math.ceil(width / 8), 0, height % 256, Math.floor(height / 256));
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < Math.ceil(width / 8); x++) {
          let byte = 0;
          for (let b = 0; b < 8; b++) {
            const i = ((y * width) + (x * 8) + b) * 4;
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (avg < 128) byte |= (0x80 >> b);
          }
          printData.push(byte);
        }
      }
      return new Uint8Array(printData);
    } catch (e) { return null; }
  };

  const handleSaveOnly = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const dateStr = new Date().toLocaleDateString('en-GB');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      const invoiceData = {
        billNo: billNo,
        date: dateStr,
        time: timeStr,
        customerName: customerName || 'Walk-in',
        customerPhone: customerPhone || '',
        customerAddress: customerAddress || '',
        customerGst: customerGst || '',
        gstEnabled: gstEnabled,
        items: cart.map(i => `${i.productName} (${i.price}x${i.quantity}${i.unit || 'pcs'})`).join(", "),
        subtotal: Math.round(subtotal),
        discount: discount,
        finalTotal: finalTotal,
        paymentMode: paymentMode
      };
      const scriptURL = "https://script.google.com/macros/s/AKfycbyAZ2OIGBTA5e8VAWyf5PE8bbc0pjW6dAex8V9E97JSqBDHhMRNL_gGaiAnXmh6K_7i/exec";
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData)
      });
      alert("Bill Saved Successfully!");
      setBillNo(prev => prev + 1);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerGst('');
      setShowPreview(false);
    } catch (error) {
      console.error("Error saving to sheet:", error);
      alert("Failed to save bill.");
    }
  };

  const handleFinalPrint = async () => {
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        alert("Bluetooth Service not available.");
        return;
      }
      let device = cachedDevice;
      if (!device || !device.gatt?.connected) {
        try {
          device = await nav.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '0000ff00-0000-1000-8000-00805f9b34fb']
          });
          cachedDevice = device;
        } catch (err) {
          return;
        }
      }
      const server = await device.gatt?.connect();
      const services = await server.getPrimaryServices();
      const char = (await services[0].getCharacteristics()).find((c: any) =>
        c.properties.write || c.properties.writeWithoutResponse
      );
      if (!char) {
        alert("Cannot connect to Printer characteristic.");
        return;
      }

      const enc = new TextEncoder();
      const INIT = '\x1B\x40';
      const CENTER = '\x1B\x61\x01';
      const LEFT = '\x1B\x61\x00';
      const BOLD_ON = '\x1B\x45\x01';
      const BOLD_OFF = '\x1B\x45\x00';
      const SIZE_BIG = '\x1D\x21\x11';
      const SIZE_NORMAL = '\x1D\x21\x00';

      await char.writeValue(enc.encode(INIT + CENTER));
      await char.writeValue(enc.encode('\x1B\x40'));
      await new Promise(r => setTimeout(r, 500));
      await char.writeValue(enc.encode('\x1B\x61\x01'));

      const sendLargeData = async (characteristic: any, data: string | Uint8Array) => {
        const chunkSize = 100;
        const encoder = new TextEncoder();
        const bytes = typeof data === 'string' ? encoder.encode(data) : data;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, i + chunkSize);
          await characteristic.writeValue(chunk);
          await new Promise(r => setTimeout(r, 10));
        }
      };

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB');
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let billHeader = `\n${SIZE_BIG}${BOLD_ON}GS Supermarket ${SIZE_NORMAL}.${BOLD_OFF}\n` +
        `Fresh Vegetables & Fruits\n` +
        `Main Road, Kovur, Chennai - 69\n--------------------------------\n` +
        `Mob: 9360380276\n--------------------------------\n` +
        `DT: ${dateStr}  TM: ${timeStr}\nBill No: ${billNo}\n`;

      if (customerName || customerPhone || customerAddress || customerGst) {
        billHeader += `--------------------------------\n`;
        if (customerName) billHeader += `Customer: ${customerName}\n`;
        if (customerPhone) billHeader += `Phone: ${customerPhone}\n`;
        if (customerAddress) billHeader += `Address: ${customerAddress}\n`;
        if (customerGst) billHeader += `Cust GST: ${customerGst}\n`;
      }

      billHeader += `----------------------------------------------\n` +
        `${LEFT}${BOLD_ON}Item                Rate         Qty      Amount${BOLD_OFF}\n` +
        `-----------------------------------------------\n`;
      await sendLargeData(char, billHeader);

      let itemsData = "";
      const STYLE_NORMAL = '\x1B\x21\x00';

      cart.forEach((item) => {
        const name = (item.productName || 'Item').substring(0, 12).padEnd(15);
        const rate = parseFloat(String(item.price)).toFixed(0).padStart(10);
        const qty = (String(item.quantity) + (item.unit || 'pcs')).padStart(9);
        const total = parseFloat(String(item.total)).toFixed(0).padStart(9);

        itemsData += `${STYLE_NORMAL}${name} ${rate} ${qty} ${total}\n`;
        itemsData += `----------------------------------------------\n`;
      });

      await sendLargeData(char, itemsData);

      let billFooter = `${BOLD_ON}${"Subtotal:".padEnd(10)}Rs.${Math.round(subtotal).toString().padStart(8)}${BOLD_OFF}\n`;
      billFooter += `${"Total Qty:".padEnd(10)}${totalQty.toString().padStart(11)}\n`;
      if (discount > 0) {
        billFooter += `${"Discount:".padEnd(10)}-Rs.${Math.round(discount).toString().padStart(8)}\n`;
      }

      if (gstEnabled) {
        billFooter += `${"CGST @ 2.5%:".padEnd(10)}Rs.${cgstAmount.toFixed(2).padStart(8)}\n`;
        billFooter += `${"SGST @ 2.5%:".padEnd(10)}Rs.${sgstAmount.toFixed(2).padStart(8)}\n`;
      }

      billFooter += `\n${SIZE_BIG}${"NET TOTAL:".padEnd(10)}Rs.${Math.round(finalTotal).toString().padStart(6)}${STYLE_NORMAL}\n`;
      billFooter += `********************************\n`;
      billFooter += `Payment: ${paymentMode}\n`;

      await sendLargeData(char, billFooter);

      if (paymentMode === 'SCANNER') {
        const qrBytes = await getImageBytes('/qr-code1.jpeg', 350);
        if (qrBytes) {
          await char.writeValue(enc.encode(CENTER));
          for (let i = 0; i < qrBytes.length; i += 25) {
            await char.writeValue(qrBytes.slice(i, i + 25));
            await new Promise(r => setTimeout(r, 10));
          }
        }
      }
      await char.writeValue(new Uint8Array([0x1b, 0x21, 0x01]));
      await char.writeValue(enc.encode(`${CENTER}Thank You! Visit Again\n`));
      await char.writeValue(new Uint8Array([0x1b, 0x21, 0x00]));

      await new Promise(r => setTimeout(r, 1000));
      const FEED_PAPER = '\n';
      await char.writeValue(enc.encode(FEED_PAPER));

      const CUT_PAPER = '\n\n\x1D\x56\x42\x00';
      try {
        await char.writeValue(enc.encode(CUT_PAPER));
      } catch (e) {
        console.error("Cut failed", e);
      }

      const scriptURL = "https://script.google.com/macros/s/AKfycbwO6j5rzaFkVUQyYeFWNTT1k-kdx6P4M61iPH1pSlQFXa04al99FyR982zoqJb3VdXl4g/exec";
      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          billNo, 
          date: dateStr, 
          time: timeStr, 
          customerName: customerName || 'Walk-in',
          customerPhone: customerPhone || '',
          customerAddress: customerAddress || '',
          customerGst: customerGst || '',
          gstEnabled,
          items: cart.map(i => `${i.productName} (${i.price}x${i.quantity}${i.unit || 'pcs'})`).join(", "), 
          subtotal, 
          discount, 
          finalTotal, 
          paymentMode 
        })
      });

      setBillNo(prev => prev + 1);
      setCart([]);
      setDiscount(0);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerGst('');
      setShowPreview(false);
      alert("Bill Printed Successfully!");
    } catch (error: any) { alert("Error: " + error.message); }
  };

  return (
    <Box className="pos-container" sx={{ bgcolor: '#0b1d42', minHeight: '100vh', color: '#fff', pb: 4 }}>
      <AppHeader
        title="Vegetables & Fruits POS"
        onBack={() => {
          if (cart.length > 0) {
            if (confirm("Cart will be cleared! Go back?")) window.history.back();
          } else {
            window.history.back();
          }
        }}
      />

      <Box className="pos-header" sx={{ textAlign: 'center', py: 1 }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>{new Date().toLocaleDateString('en-GB')}</Typography>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff' }}>GS Supermarket - Fresh Section</Typography>
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1, bgcolor: '#06102b' }}>
        <Tabs
          value={selectedTab}
          onChange={(_e, val) => setSelectedTab(val)}
          textColor="inherit"
          indicatorColor="primary"
          variant="fullWidth"
          sx={{ '& .MuiTab-root': { color: '#bbb', fontWeight: 'bold' }, '& .Mui-selected': { color: '#ffeb3b !important' } }}
        >
          <Tab label="Vegetables" value="Vegetables" />
          <Tab label="Fruits" value="Fruits" />
          <Tab label="Grocery" value="Grocery" />
        </Tabs>
      </Box>

      {/* Product Tiles Grid with Images */}
      <Box sx={{ px: 1.5, py: 1, maxHeight: '32vh', overflowY: 'auto' }}>
        <Grid container spacing={1.5}>
          {filteredProducts.map(p => (
            <Grid size={4} key={p.id}>
              <Box
                onClick={() => handleTileClick(p)}
                sx={{
                  border: '1px solid #ffffff33',
                  borderRadius: 2,
                  p: 1,
                  cursor: 'pointer',
                  bgcolor: '#ffffff',
                  color: '#0b1d42',
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  '&:active': { transform: 'scale(0.97)' }
                }}
              >
                <Box
                  component="img"
                  src={p.image}
                  alt={p.name}
                  onError={(e: any) => { e.target.src = 'https://via.placeholder.com/40?text=Item'; }}
                  sx={{ width: 40, height: 40, objectFit: 'contain' }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#0b1d42', textAlign: 'center', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {p.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Custom Item Add */}
      <Box sx={{ px: 1.5, pt: 0.5 }}>
        <Chip
          label="+ Add Custom Item"
          size="small"
          clickable
          onClick={handleDirectCustomClick}
          sx={{
            bgcolor: 'transparent',
            color: '#fff',
            border: '1px dashed #fff',
            fontWeight: 'bold',
            borderRadius: '16px',
            px: 1.5,
            '&:hover': { bgcolor: '#ffffff22' }
          }}
        />
      </Box>

      {/* Cart List */}
      <Box className="item-list" sx={{ mt: 1, px: 1, flex: 1, minHeight: '130px', maxHeight: '20vh', overflowY: 'auto', bgcolor: '#ffffff0a', borderRadius: 2, mx: 1 }}>
        <Typography variant="caption" sx={{ px: 1, py: 0.5, color: '#ffeb3b', fontWeight: 'bold', display: 'block' }}>
          Cart Items (Edit Name, Rate & Qty below):
        </Typography>
        {cart.map((item, index) => (
          <Box key={item.productId} sx={{ p: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid size={1}>
                <Typography variant="body2" sx={{ color: '#fff' }}>{index + 1}</Typography>
              </Grid>
              <Grid size={4}>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Item name..."
                  value={item.productName}
                  onChange={(e) => updateCartItemName(item.productId, e.target.value)}
                  InputProps={{ disableUnderline: true }}
                  sx={{ '& input': { fontWeight: 'bold', fontSize: '0.85rem', p: 0, color: '#fff' }, '& input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 } }}
                />
              </Grid>
              <Grid size={4} display="flex" alignItems="center" gap={0.5}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Rate"
                  inputRef={(el) => (rateInputRefs.current[item.productId] = el)}
                  value={item.price || ''}
                  onChange={(e) => updateCartItemRate(item.productId, parseFloat(e.target.value))}
                  sx={{ width: '55px', bgcolor: '#fff', borderRadius: 1, '& input': { p: 0.5, textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' } }}
                />
                <Typography variant="caption" sx={{ color: '#fff' }}>×</Typography>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Qty"
                  value={item.quantity || ''}
                  onChange={(e) => updateCartItemQty(item.productId, parseFloat(e.target.value))}
                  sx={{ width: '45px', bgcolor: '#fff', borderRadius: 1, '& input': { p: 0.5, textAlign: 'center', fontSize: '0.85rem' } }}
                />
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>{item.unit || 'pcs'}</Typography>
              </Grid>
              <Grid size={3} display="flex" justifyContent="flex-end" alignItems="center">
                <Typography variant="body2" fontWeight="bold" sx={{ mr: 1, color: '#4caf50' }}>
                  ₹{item.total}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setCart(cart.filter(i => i.productId !== item.productId))}
                  sx={{ color: '#ff5252' }}
                >
                  <X size={14} />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}
        <div ref={cartEndRef} className="scroll-anchor" />
      </Box>

      {/* Actions Footer */}
      <Box className="footer-actions" sx={{ mt: 'auto', px: 2, pt: 1 }}>
        <Stack direction="row" justifyContent="space-around" mb={1} sx={{ py: 0.5 }}>
          <Typography variant="body2">Items: <b>{noOfItems}</b></Typography>
          <Typography variant="body2">Total Qty: <b>{totalQty}</b></Typography>
        </Stack>
        <Stack direction="row" justifyContent="center" spacing={4} mb={1}>
          <FormControlLabel 
            control={<Checkbox size="small" checked={paymentMode === 'CASH'} onChange={() => setPaymentMode('CASH')} sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }} />} 
            label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>CASH</Typography>} 
          />
          <FormControlLabel 
            control={<Checkbox size="small" checked={paymentMode === 'SCANNER'} onChange={() => setPaymentMode('SCANNER')} sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }} />} 
            label={<Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>SCANNER</Typography>} 
          />
        </Stack>
        <Button variant="contained" fullWidth sx={{ bgcolor: '#1976d2', border: '1px solid #fff', py: 1.5, fontWeight: 'bold' }} startIcon={<Printer size={20} />} onClick={() => setShowPreview(true)}>
          TOTAL: ₹{finalTotal.toLocaleString('en-IN')} - PREVIEW
        </Button>
      </Box>

      {/* Quantity & Rate Pop-up Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#0b1d42' }}>
          {step === 'QTY' ? 'Enter Quantity' : 'Confirm Rate (Price)'}
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#333' }}>
            {selectedProduct?.name}
          </Typography>

          {step === 'QTY' ? (
            <Box>
              <TextField
                autoFocus
                fullWidth
                label={`Quantity (${selectedProduct?.unit || 'pcs'})`}
                type="number"
                value={tempQty}
                onChange={(e) => setTempQty(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleQtySubmit(); }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleQtySubmit}
                sx={{ bgcolor: '#0b1d42', color: '#fff', fontWeight: 'bold', py: 1.2 }}
              >
                Next (Enter Rate)
              </Button>
            </Box>
          ) : (
            <Box>
              <TextField
                autoFocus
                fullWidth
                label="Rate per unit (₹)"
                type="number"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRateSubmit(); }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleRateSubmit}
                sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 'bold', py: 1.2 }}
              >
                Add to Bill
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="outlined" color="error" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ bgcolor: '#fff9c4', textAlign: 'center', fontWeight: 'bold' }}>Bill Preview</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight="bold">GS Supermarket</Typography>
            <Typography variant="caption" display="block">Fresh Vegetables & Fruits</Typography>
          </Box>
          
          <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
          
          <Stack spacing={1} sx={{ mb: 1.5 }}>
            <TextField label="Customer Name" size="small" fullWidth value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <TextField label="Customer Phone" size="small" fullWidth value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <TextField label="Address" size="small" fullWidth value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
            <TextField label="Customer GSTIN (Optional)" size="small" fullWidth value={customerGst} onChange={(e) => setCustomerGst(e.target.value)} />
            <FormControlLabel
              control={<Switch checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} />}
              label={`Enable GST (2.5% CGST + 2.5% SGST)`}
            />
          </Stack>

          <Divider sx={{ my: 1, borderStyle: 'dashed' }} />

          {cart.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, borderBottom: '1px dashed #eee', pb: 0.5 }}>
              <Typography variant="body2">
                {i + 1}. {item.productName} ({item.price} × {item.quantity}{item.unit || 'pcs'})
              </Typography>
              <Typography variant="body2">
                ₹{Number(item.total).toFixed(2)}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">₹{subtotal.toFixed(2)}</Typography>
          </Box>

          {discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Discount:</Typography>
              <Typography variant="body2">-₹{discount.toFixed(2)}</Typography>
            </Box>
          )}

          {gstEnabled && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">CGST @ 2.5%:</Typography>
                <Typography variant="body2">₹{cgstAmount.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">SGST @ 2.5%:</Typography>
                <Typography variant="body2">₹{sgstAmount.toFixed(2)}</Typography>
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="h6" fontWeight="bold">Net Total:</Typography>
            <Typography variant="h6" fontWeight="bold">₹{finalTotal.toFixed(2)}</Typography>
          </Box>

          {paymentMode === 'SCANNER' && (
            <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px dashed #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>Scan to Pay</Typography>
              <Box component="img" src="/qr-code1.jpeg" alt="QR" sx={{ width: '120px', height: '120px', objectFit: 'contain', mt: 1 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#fff9c4', p: 2, flexDirection: 'column', gap: 1 }}>
          {showDiscountInput && (
            <TextField label="Discount" type="number" size="small" fullWidth autoFocus sx={{ bgcolor: 'white' }}
              value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
          )}
          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
            <Button fullWidth variant="outlined" onClick={() => setShowPreview(false)}>Edit</Button>
            <Button fullWidth variant="outlined" onClick={() => setShowDiscountInput(!showDiscountInput)}>Discount</Button>
          </Stack>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, width: '100%' }}>
            <Button variant="contained" fullWidth onClick={handleFinalPrint} sx={{ bgcolor: '#4caf50' }}>Print & Save</Button>
            <Button variant="outlined" fullWidth onClick={handleSaveOnly} startIcon={<Save size={20} />} sx={{ color: '#2196f3', borderColor: '#2196f3' }}>Save Only</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}