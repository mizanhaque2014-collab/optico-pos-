'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Customer, Invoice, Prescription, OrderItem } from '@/lib/types';
import { 
  ArrowLeft, Search, Filter, MessageSquare, Send, Calendar, Cake, Flame,
  Clock, Bell, RefreshCw, BarChart2, Star, Download, Printer, Share2, 
  User, CheckCircle, AlertTriangle, ChevronRight, X, Phone, ShoppingCart, 
  Plus, BookOpen, Mail, Clipboard, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { shopConfig } from '@/lib/shopConfig';

interface Props {
  onBack: () => void;
}

// Structured mock campaign metrics
interface CampaignLog {
  id: string;
  name: string;
  date: string;
  audienceCount: number;
  delivered: number;
  failed: number;
  read: number;
  replied: number;
  type: string;
}

// Structured feedback rating entries
interface NPSEntry {
  id: string;
  customerName: string;
  mobile: string;
  score: number; // 0-10
  feedback: string;
  date: string;
}

export function WhatsAppMarketingView({ onBack }: Props) {
  const store = useStore();
  const [referenceTime] = useState(() => Date.now());

  // Database states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Category & Range Filter configurations
  const [customerFilter, setCustomerFilter] = useState<string>('All Customers');

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'last_month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // UI interaction states
  const [selectedCampaignType, setSelectedCampaignType] = useState<string>('🎉 Festival Offer');
  const [selectedCustomerForPreview, setSelectedCustomerForPreview] = useState<Customer | null>(null);
  const [customTemplateText, setCustomTemplateText] = useState<string>('');
  
  // Custom states for campaign wizard steps execution
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [confirmCampaignModal, setConfirmCampaignModal] = useState<boolean>(false);
  const [lastSentDetails, setLastSentDetails] = useState<{
    campaignName: string;
    customersCount: number;
    recipientCount: number;
    messageTemplate: string;
    delivered: number;
    failed: number;
    pending: number;
    channel: 'WhatsApp' | 'Email';
  } | null>(null);

  // Modals & Popups
  const [activeCustomerPopup, setActiveCustomerPopup] = useState<Customer | null>(null);
  const [activeNPSModal, setActiveNPSModal] = useState<Customer | null>(null);
  const [selectedReportView, setSelectedReportView] = useState<'campaign' | 'delivery' | 'read' | 'nps' | 'growth'>('campaign');
  
  // Simulated feedback dialog rating state
  const [npsScoreSelection, setNpsScoreSelection] = useState<number>(10);
  const [npsCommentsText, setNpsCommentsText] = useState<string>('');

  // Active persistent states
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);
  const [npsResponses, setNpsResponses] = useState<NPSEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter thresholds for automated reminders
  const [eyeTestThresholdMonths, setEyeTestThresholdMonths] = useState<number>(12);
  const [contactLensThresholdDays, setContactLensThresholdDays] = useState<number>(60);
  const [npsThresholdDays, setNpsThresholdDays] = useState<number>(15);

  // Predefined marketing campaigns metadata dictionaries matching STEP 1 EXACTLY
  const CAMPAIGN_TEMPLATES: Record<string, string> = {
    '👁 Eye Test Reminder': 'Dear {CustomerName},\n\nIt has been some time since your last eye examination.\n\nPlease visit us for a comprehensive eye test.\n\nRegards,\n{StoreName}',
    '📦 Contact Lens Refill': 'Dear {CustomerName},\n\nYour contact lens replacement date may be approaching.\n\nPlease visit us for your next refill pack of soft daily/monthly lenses.\n\nRegards,\n{StoreName}',
    '🎉 Festival Offer': '🎉 Special Festive Greetings from {StoreName}!\n\nDear {CustomerName},\n\nCelebrate this festive season with an exclusive 25% DISCOUNT on all Branded Frames and Sunglasses! Treat yourself and your loved ones to clearer vision. Show this message at any of our branches to redeem your offer.\n\nRegards,\n{StoreName}',
    '🎁 Discount Offer': '🎁 Exclusive VIP Privilege discount from {StoreName}!\n\nDear {CustomerName},\n\nEnjoy a flat ₹1,000 Off on your next purchase of Premium Anti-Glare Lenses. Show this message during billing. Last purchase: {LastPurchaseDate}. Visit today!\n\nRegards,\n{StoreName}',
    '⭐ NPS Feedback': '⭐ Your feedback means the world to us!\n\nDear {CustomerName},\n\nThank you for choosing {StoreName}.\n\nPlease rate your optical purchase & customer experience from 0 to 10 by clicking our smart response panel.\n\nRegards,\n{StoreName}',
    '📢 Custom Campaign': '📢 Greetings from {StoreName}!\n\nDear {CustomerName},\n\nWe hope you are having an exceptional day! We have amazing customized eyeglasses and customized prescription solutions waiting for you today. Drop by for a cup of tea!\n\nRegards,\n{StoreName}'
  };

  // Pre-seed mock data lists to populate logs securely if storage is empty
  const populateDefaultLogs = () => {
    const cachedLogs = localStorage.getItem('optical_campaign_logs');
    const cachedNPS = localStorage.getItem('optical_campaign_nps');

    if (cachedLogs) {
      setCampaignLogs(JSON.parse(cachedLogs));
    } else {
      const defaultLogs: CampaignLog[] = [
        { id: 'l-1', name: '🎉 Festival Sparkle - Eid Special', date: '2026-05-10', audienceCount: 42, delivered: 42, failed: 0, read: 38, replied: 14, type: 'Festival Offer' },
        { id: 'l-2', name: '👁 Annual Optometry Checkup Drive', date: '2026-05-24', audienceCount: 18, delivered: 17, failed: 1, read: 15, replied: 8, type: 'Eye Test Reminder' },
        { id: 'l-3', name: '🎂 June Birthday Reward coupons', date: '2026-06-01', audienceCount: 9, delivered: 9, failed: 0, read: 9, replied: 4, type: 'Birthday Wish' },
        { id: 'l-4', name: '📦 Monthly Soft-contact lens Replenish', date: '2026-06-15', audienceCount: 7, delivered: 7, failed: 0, read: 6, replied: 3, type: 'Contact Lens Refill Reminder' },
        { id: 'l-5', name: '⭐ Post-Billing Quality NPS Review', date: '2026-06-18', audienceCount: 15, delivered: 15, failed: 0, read: 14, replied: 11, type: 'NPS Feedback Request' }
      ];
      setCampaignLogs(defaultLogs);
      localStorage.setItem('optical_campaign_logs', JSON.stringify(defaultLogs));
    }

    if (cachedNPS) {
      setNpsResponses(JSON.parse(cachedNPS));
    } else {
      const defaultNPS: NPSEntry[] = [
        { id: 'nps-1', customerName: 'Arun Sharma', mobile: '9876543210', score: 10, feedback: 'Extremely quick optician evaluation. Ray-Ban selection is superb!', date: '2026-06-18' },
        { id: 'nps-2', customerName: 'Priya Patel', mobile: '9123456789', score: 9, feedback: 'The progressive glass alignment feels high-tech. Great staff assistance.', date: '2026-06-19' },
        { id: 'nps-3', customerName: 'Rohan Deshmukh', mobile: '8888777766', score: 8, feedback: 'Got Oakley frames with high-index lenses. Fast delivery.', date: '2026-06-20' },
        { id: 'nps-4', customerName: 'Kabir Sen', mobile: '7766554433', score: 4, feedback: 'Order delayed in optical testing lab by 3 days. Power is perfect though.', date: '2026-06-10' }
      ];
      setNpsResponses(defaultNPS);
      localStorage.setItem('optical_campaign_nps', JSON.stringify(defaultNPS));
    }
  };

  const loadData = () => {
    const custs = store.getCustomers();
    const invs = store.getInvoices();
    setCustomers(custs);
    setInvoices(invs);
    
    if (custs.length > 0 && !selectedCustomerForPreview) {
      setSelectedCustomerForPreview(custs[0]);
    }
  };

  useEffect(() => {
    loadData();
    populateDefaultLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceTime]);

  // Synchronize Custom campaigns inputs or default variables mapping on template changes
  useEffect(() => {
    if (selectedCampaignType) {
      setCustomTemplateText(CAMPAIGN_TEMPLATES[selectedCampaignType] || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaignType]);

  // Unified core marketing classifications calculated directly from database records
  const processedCustomers = useMemo(() => {
    const parsedToday = new Date(referenceTime);
    parsedToday.setHours(0, 0, 0, 0);

    return customers.map(c => {
      const custInvoices = invoices.filter(i => i.customerId === c.id);
      const isCancelledFiltered = (inv: Invoice) => inv.status !== 'Cancelled';
      const activeInvs = custInvoices.filter(isCancelledFiltered);

      // Extract specific purchases for filters
      const hasDirectSale = activeInvs.some(i => i.type === 'Direct Sale');
      const hasSalesOrder = activeInvs.some(i => i.type === 'Sales Order');
      const latestInvoice = activeInvs.sort((a, b) => b.createdAt - a.createdAt)[0];
      
      const hasContractLens = activeInvs.some(i => 
        i.items.some(item => item.productType === 'Contact Lens')
      );
      const hasFrame = activeInvs.some(i => 
        i.items.some(item => item.itemType === 'frame' && item.productType !== 'Sunglass')
      );
      const hasSunglass = activeInvs.some(i => 
        i.items.some(item => item.itemType === 'frame' && item.productType === 'Sunglass')
      );
      const hasProgressive = activeInvs.some(i => 
        i.items.some(item => item.itemType === 'lens' && item.lensCategory === 'Progressive')
      );
      const hasBlueCut = activeInvs.some(i => 
        i.items.some(item => item.itemType === 'lens' && item.lensCategory === 'Blue Cut')
      );
      
      const lastVisitTime = latestInvoice ? latestInvoice.createdAt : c.createdAt;
      const prescriptionsCount = c.prescriptions?.length || 0;

      // Determine precise metadata
      return {
        customer: c,
        hasDirectSale,
        hasSalesOrder,
        hasContractLens,
        hasFrame,
        hasSunglass,
        hasProgressive,
        hasBlueCut,
        latestInvoice,
        lastVisitTime,
        prescriptionsCount,
        purchaseValueTotal: activeInvs.reduce((sum, current) => sum + current.grandTotal, 0),
        pendingAmountTotal: activeInvs.reduce((sum, current) => current.status !== 'Delivered' ? sum + current.balanceAmount : sum, 0)
      };
    });
  }, [customers, invoices, referenceTime]);

  // Master Customer Filters Suite
  const filteredCustomers = useMemo(() => {
    return processedCustomers.filter(item => {
      // 1. Search term match
      if (String(searchTerm ?? "").trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.customer.name.toLowerCase().includes(q);
        const matchesMobile = item.customer.mobile ? String(item.customer.mobile).includes(q) : false;
        const matchesID = item.customer.id.toLowerCase().includes(q);
        if (!matchesName && !matchesMobile && !matchesID) return false;
      }

      // 2. Class Type Matcher (supports both original trigger panel configure and new step 3 filter formats)
      if ((customerFilter === 'Direct Sale' || customerFilter === 'Direct Sale Customers') && !item.hasDirectSale) return false;
      if ((customerFilter === 'Sales Order' || customerFilter === 'Sales Order Customers') && !item.hasSalesOrder) return false;
      if ((customerFilter === 'Eye Test' || customerFilter === 'Eye Test Customers') && item.prescriptionsCount === 0) return false;
      if (customerFilter === 'Prescription' && item.prescriptionsCount === 0 && item.customer.status !== 'Prescription Only') return false;
      if ((customerFilter === 'Contact Lens' || customerFilter === 'Contact Lens Customers') && !item.hasContractLens) return false;
      if ((customerFilter === 'Frame' || customerFilter === 'Frame Customers') && !item.hasFrame) return false;
      if ((customerFilter === 'Sunglass' || customerFilter === 'Sunglass Customers') && !item.hasSunglass) return false;
      if ((customerFilter === 'Progressive' || customerFilter === 'Progressive Lens Customers') && !item.hasProgressive) return false;
      if (customerFilter === 'Blue Cut' && !item.hasBlueCut) return false;

      // 3. Date Filters matcher (filters customer latest activity date/invoice/creation)
      const now = new Date(referenceTime);
      const activityRange = now.getTime() - item.lastVisitTime;

      if (dateFilter === 'today') {
        const midnight = new Date(referenceTime);
        midnight.setHours(0,0,0,0);
        return item.lastVisitTime >= midnight.getTime();
      }
      if (dateFilter === 'week') {
        return activityRange <= 7 * 24 * 3600 * 1000;
      }
      if (dateFilter === 'month') {
        return activityRange <= 30 * 24 * 3600 * 1000;
      }
      if (dateFilter === 'last_month') {
        const thirtyDays = 30 * 24 * 3600 * 1000;
        const sixtyDays = 60 * 24 * 3600 * 1000;
        return activityRange > thirtyDays && activityRange <= sixtyDays;
      }
      if (dateFilter === 'custom') {
        const startBound = customStart ? new Date(customStart).getTime() : 0;
        const endDay = customEnd ? new Date(customEnd) : new Date(referenceTime);
        endDay.setHours(23, 59, 59, 999);
        const endBound = endDay.getTime();
        return item.lastVisitTime >= startBound && item.lastVisitTime <= endBound;
      }

      return true;
    });
  }, [processedCustomers, customerFilter, dateFilter, customStart, customEnd, searchTerm, referenceTime]);

  // Synchronize customer checklist selection map when filtered list changes
  useEffect(() => {
    const nextMap: Record<string, boolean> = {};
    filteredCustomers.forEach(item => {
      nextMap[item.customer.id] = true;
    });
    setSelectedMap(nextMap);
  }, [filteredCustomers]);

  // Phone helper checking for 10+ digits validity
  const cleanPhoneDigits = (num?: string) => {
    if (!num) return '';
    return num.replace(/\D/g, '');
  };

  const isEligibleForWhatsApp = (num?: string) => {
    const digits = cleanPhoneDigits(num);
    return digits.length >= 10;
  };

  const activeCheckedCustomers = useMemo(() => {
    return filteredCustomers.filter(item => !!selectedMap[item.customer.id]);
  }, [filteredCustomers, selectedMap]);

  const selectedCount = activeCheckedCustomers.length;

  const whatsappEligibleCount = useMemo(() => {
    return activeCheckedCustomers.filter(item => isEligibleForWhatsApp(item.customer.mobile)).length;
  }, [activeCheckedCustomers]);

  const noWhatsappCount = selectedCount - whatsappEligibleCount;

  // Campaign Analytics summaries
  const campaignAnalytics = useMemo(() => {
    const totalDelivered = campaignLogs.reduce((sum, log) => sum + log.delivered, 0);
    const totalRead = campaignLogs.reduce((sum, log) => sum + log.read, 0);
    const totalReplies = campaignLogs.reduce((sum, log) => sum + log.replied, 0);
    const totalNPSResponses = npsResponses.length;
    const averageNPS = totalNPSResponses > 0 
      ? Number((npsResponses.reduce((sum, entry) => sum + entry.score, 0) / totalNPSResponses).toFixed(1)) 
      : 8.5;

    return {
      totalCustomers: customers.length,
      totalCampaignsCount: campaignLogs.length,
      totalDelivered,
      totalRead,
      totalReplies,
      totalNPSResponses,
      averageNPS
    };
  }, [customers, campaignLogs, npsResponses]);

  // Automated segment counts generator (Eye test reminder targets, Refill targets, Birthday targets, NPS targets)
  const segmentStats = useMemo(() => {
    // 1. Eye Test Targets helper (not tested within threshold months based on prescription date/visit date)
    const eyeTestTargetsCount = processedCustomers.filter(item => {
      const monthsElapsed = (referenceTime - item.lastVisitTime) / (30 * 24 * 3600 * 1000);
      return monthsElapsed >= eyeTestThresholdMonths;
    }).length;

    // 2. Contact Lens Refill Targets count
    const refillTargetsCount = processedCustomers.filter(item => {
      if (!item.hasContractLens) return false;
      const daysElapsed = (referenceTime - item.lastVisitTime) / (24 * 3600 * 1000);
      return daysElapsed >= contactLensThresholdDays;
    }).length;

    // 3. Birthday Wish Targets count
    const birthdayTargetsCount = customers.filter(c => {
      if (!c.dob) return false;
      const dobDate = new Date(c.dob);
      const todayDate = new Date(referenceTime);
      return dobDate.getMonth() === todayDate.getMonth(); // same month active
    }).length;

    // 4. Post-Purchase NPS Feedback targets
    const npsFeedbackTargetsCount = processedCustomers.filter(item => {
      const daysElapsed = (referenceTime - item.lastVisitTime) / (24 * 3600 * 1000);
      return daysElapsed <= npsThresholdDays && item.purchaseValueTotal > 0;
    }).length;

    return {
      eyeTestTargetsCount,
      refillTargetsCount,
      birthdayTargetsCount,
      npsFeedbackTargetsCount
    };
  }, [processedCustomers, customers, referenceTime, eyeTestThresholdMonths, contactLensThresholdDays, npsThresholdDays]);

  // Real-time Template Compilation Engine
  const compileTemplateMessage = (templateText: string, cust: Customer | null) => {
    if (!cust) return 'No customer selected for campaign compilation.';
    const custInvs = invoices.filter(i => i.customerId === cust.id);
    const validInvs = [...custInvs].sort((a,b) => b.createdAt - a.createdAt);
    const lastInvoice = validInvs[0];

    const storeName = shopConfig.shopName;
    const offerName = selectedCampaignType;
    const clientName = cust.name;
    const clientPhone = cust.mobile;
    const lastVisitText = lastInvoice 
      ? new Date(lastInvoice.createdAt).toLocaleDateString('en-GB') 
      : new Date(cust.createdAt).toLocaleDateString('en-GB');
    const lastPurchaseText = lastInvoice 
      ? `₹${lastInvoice.grandTotal.toLocaleString('en-IN')} on ${new Date(lastInvoice.createdAt).toLocaleDateString('en-GB')}`
      : 'No previous purchases found';

    return templateText
      .replace(/{CustomerName}/g, clientName)
      .replace(/{MobileNumber}/g, clientPhone)
      .replace(/{LastVisitDate}/g, lastVisitText)
      .replace(/{LastPurchaseDate}/g, lastPurchaseText)
      .replace(/{StoreName}/g, storeName)
      .replace(/{OfferName}/g, offerName);
  };

  // Helper mapping selection changes to correct class targeted customers filters automatically
  const handleSelectCampaignType = (type: string) => {
    setSelectedCampaignType(type);
    
    // Proactively segment default filter based on chosen campaign goals
    if (type.includes('Eye Test')) {
      setCustomerFilter('Eye Test Customers');
    } else if (type.includes('Contact Lens')) {
      setCustomerFilter('Contact Lens Customers');
    } else {
      setCustomerFilter('All Customers');
    }
  };

  // Execute Simulated Campaign Delivery mapping logs metrics
  const handleExecuteSendCampaign = (channel: 'WhatsApp' | 'Email') => {
    const totalSelected = selectedCount;
    const totalEligible = whatsappEligibleCount;
    
    // High premium transmission rates
    const deliveredCount = totalEligible > 0 ? Math.floor(totalEligible * 0.95) : 0;
    const failedCount = totalEligible - deliveredCount;
    
    const newLogName = `${channel === 'WhatsApp' ? '📱' : '📧'} ${selectedCampaignType} Broadcast`;
    
    const newLogEntry: CampaignLog = {
      id: `l-manual-${Date.now()}`,
      name: newLogName,
      date: new Date().toISOString().slice(0, 10),
      audienceCount: totalSelected,
      delivered: deliveredCount,
      failed: failedCount,
      read: Math.floor(deliveredCount * 0.78),
      replied: Math.floor(deliveredCount * 0.18),
      type: selectedCampaignType
    };
    
    const updatedLogs = [newLogEntry, ...campaignLogs];
    setCampaignLogs(updatedLogs);
    localStorage.setItem('optical_campaign_logs', JSON.stringify(updatedLogs));
    
    setLastSentDetails({
      campaignName: selectedCampaignType,
      customersCount: totalSelected,
      recipientCount: totalEligible,
      messageTemplate: customTemplateText,
      delivered: deliveredCount,
      failed: failedCount,
      pending: 0,
      channel
    });
    
    setConfirmCampaignModal(false);
    setToastMessage(`🚀 ${channel} Campaign successfully initiated! Results loaded below.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle selection for all filtered customers
  const handleToggleSelectAll = (checked: boolean) => {
    const nextMap = { ...selectedMap };
    filteredCustomers.forEach(item => {
      nextMap[item.customer.id] = checked;
    });
    setSelectedMap(nextMap);
  };

  // Toggle selection for individual customer checkboxes
  const handleToggleSelectOne = (id: string, checked: boolean) => {
    setSelectedMap(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  // WhatsApp Broadcast Trigger Function (Simulated visual sending)
  const handleSendBroadcast = (targetGroup: 'selected' | 'filtered' | 'all') => {
    let targets: Customer[] = [];
    if (targetGroup === 'selected') {
      if (selectedCustomerForPreview) targets = [selectedCustomerForPreview];
    } else if (targetGroup === 'filtered') {
      targets = filteredCustomers.map(i => i.customer);
    } else {
      targets = customers;
    }

    if (targets.length === 0) {
      alert('Kindly select or filter valid customer listings first!');
      return;
    }

    // Capture visual confirmation
    const newLogName = `📢 ${selectedCampaignType} Broadcast (${targets.length} targets)`;
    const newLogEntry: CampaignLog = {
      id: `l-manual-${Date.now()}`,
      name: newLogName,
      date: new Date().toISOString().slice(0, 10),
      audienceCount: targets.length,
      delivered: targets.length,
      failed: 0,
      read: Math.ceil(targets.length * 0.82), // simulated high rate
      replied: Math.ceil(targets.length * 0.24), // simulated engagement
      type: selectedCampaignType
    };

    const updatedLogs = [newLogEntry, ...campaignLogs];
    setCampaignLogs(updatedLogs);
    localStorage.setItem('optical_campaign_logs', JSON.stringify(updatedLogs));

    setToastMessage(`🚀 Broadcast Campaign successfully emitted to ${targets.length} customer nodes over WhatsApp Gateway queue!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Submit Simulated NPS Score
  const handleSaveNPSSubmission = () => {
    if (!activeNPSModal) return;

    const newNpsRaw: NPSEntry = {
      id: `nps-submit-${Date.now()}`,
      customerName: activeNPSModal.name,
      mobile: activeNPSModal.mobile,
      score: npsScoreSelection,
      feedback: npsCommentsText || 'No comments left.',
      date: new Date().toISOString().slice(0, 10)
    };

    const updatedNpsList = [newNpsRaw, ...npsResponses];
    setNpsResponses(updatedNpsList);
    localStorage.setItem('optical_campaign_nps', JSON.stringify(updatedNpsList));

    setNpsCommentsText('');
    setActiveNPSModal(null);

    setToastMessage(`⭐ Stored client Net Promoter Score (${npsScoreSelection}/10) inside master optical audit register!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Excel CSV exporter for customer campaigns list
  const handleExportCustomersExcel = (typeParam: string) => {
    let listToExport = filteredCustomers;
    let fileNameStr = "Filtered_Campaign_Audience";

    if (typeParam === 'Contact Lens') {
      listToExport = processedCustomers.filter(item => item.hasContractLens);
      fileNameStr = "Contact_Lens_Exclusive_Audience";
    } else if (typeParam === 'Eye Test') {
      listToExport = processedCustomers.filter(item => item.prescriptionsCount > 0);
      fileNameStr = "Eye_Test_Active_Audience";
    } else if (typeParam === 'Birthday') {
      listToExport = processedCustomers.filter(item => {
        if (!item.customer.dob) return false;
        return new Date(item.customer.dob).getMonth() === new Date(referenceTime).getMonth();
      });
      fileNameStr = "Birthday_Month_Celebrations_Audience";
    }

    const headers = [
      'Customer ID', 'Customer Name', 'Mobile Number', 'Customer Type', 
      'Last Visit Date', 'Last Purchase Value (₹)', 'Pending Balance (₹)', 'Optometry Tests'
    ];

    const rows = listToExport.map(item => [
      item.customer.id,
      item.customer.name,
      item.customer.mobile,
      item.customer.status || 'Buyer',
      new Date(item.lastVisitTime).toLocaleDateString(),
      item.purchaseValueTotal.toString(),
      item.pendingAmountTotal.toString(),
      item.prescriptionsCount.toString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileNameStr}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Interactive PDF Report Compiler & Printer
  const handlePrintNPSTeamReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const npsLogHTML = npsResponses.map(item => {
      let scoreCategory = "PROMOTER [9-10]";
      let scoreColor = "#10b981";
      if (item.score < 7) {
        scoreCategory = "DETRACTOR [0-6]";
        scoreColor = "#ef4444";
      } else if (item.score < 9) {
        scoreCategory = "PASSIVE [7-8]";
        scoreColor = "#f59e0b";
      }

      return `
        <tr>
          <td>${item.customerName}</td>
          <td>${item.mobile}</td>
          <td><strong style="color: ${scoreColor}; font-size: 14px;">${item.score}/10</strong></td>
          <td><span style="font-size: 9px; padding: 2px 5px; background: #f1f5f9; border-radius: 4px; font-weight: bold; color: #475569;">${scoreCategory}</span></td>
          <td>"${item.feedback}"</td>
          <td>${item.date}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
      <head>
        <title>Customer Net Promoter Score & Feedback Audit</title>
        <style>
          body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; }
          .logo-header { border-bottom: 3px double #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          h1 { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 0; color: #0f172a; }
          .metrics { display: flex; gap: 20px; margin-bottom: 30px; }
          .metric-card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; background: #faf5ff; }
          .m-title { font-size: 9px; text-transform: uppercase; font-weight: bold; color: #64748b; }
          .m-value { font-size: 22px; font-weight: 900; color: #7c3aed; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background: #581c87; color: white; padding: 8px; text-align: left; text-transform: uppercase; font-size: 10px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="logo-header">
          <div>
            <h1>Customer NPS Survey & Loyalty Ledger</h1>
            <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold;">{shopConfig.shopName}</span>
          </div>
          <div style="text-align: right; font-size: 11px; font-weight: bold; color: #475569;">
            Date Compiled: ${new Date().toLocaleDateString('en-IN')}
          </div>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="m-title">Total NPS Feedbacks Logged</div>
            <div class="m-value">${npsResponses.length} Surveys</div>
          </div>
          <div class="metric-card" style="background: #f0fdf4;">
            <div class="m-title" style="color: #15803d;">Group Benchmark NPS</div>
            <div class="m-value" style="color: #15803d;">${campaignAnalytics.averageNPS} / 10</div>
          </div>
          <div class="metric-card" style="background: #ecfeff;">
            <div class="m-title" style="color: #0891b2;">Promoter Ratio Target</div>
            <div class="m-value" style="color: #0891b2;">86% Excellent</div>
          </div>
        </div>

        <h3>Active Client Loyalty Feedback Index</h3>
        <table>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Mobile</th>
              <th>Score Given</th>
              <th>Classification</th>
              <th>Feedback Note</th>
              <th>Survey Date</th>
            </tr>
          </thead>
          <tbody>
            ${npsLogHTML || '<tr><td colspan="6" style="text-align:center">No feedback rating cards received yet.</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          Business Intelligence Module • Confidantial Management Report • System Ref: NPS-AUDIT
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6" id="whatsapp-marketing-campaign-module">
      
      {/* 🌟 SUBHEADER INTERACTIVE BANNER */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-5 bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-white/5 rounded-full transition-colors border border-white/10"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📱</span>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">WhatsApp Campaign &amp; Marketing Engine</h2>
            </div>
            <p className="text-[10px] text-white/50 tracking-wider font-bold uppercase mt-0.5">
              Targeted retention triggers, Automated optical reminders &amp; loyalty NPS manager
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Quick interactive shortcuts buttons to trigger campaigns excel list downloads instantly */}
          <button
            onClick={() => handleExportCustomersExcel('Birthday')}
            className="text-[10px] font-black px-3 py-1.5 bg-purple-950/40 border border-purple-800/40 hover:bg-purple-900/40 text-purple-200 rounded-lg uppercase tracking-wider flex items-center gap-1.5"
            title="Export customers with birthday this month"
          >
            <Cake size={12} />
            <span>Birthday Month List</span>
          </button>

          <button
            onClick={() => handleExportCustomersExcel('Contact Lens')}
            className="text-[10px] font-black px-3 py-1.5 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/40 text-cyan-200 rounded-lg uppercase tracking-wider flex items-center gap-1.5"
            title="Export contact lens campaign segment"
          >
            <RefreshCw size={12} />
            <span>Contact Lens Refills</span>
          </button>
        </div>
      </div>

      {/* TOAST SYSTEM ACCORDING TO ACCESSIBILITY INSTRUCTIONS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-950/90 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs font-bold shadow-lg flex items-center gap-2.5"
          >
            <CheckCircle className="text-emerald-400 shrink-0" size={16} />
            <span className="flex-1">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 SECTION A: CAMPAIGN MAIN ANALYTICS DASHBOARD PANELS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Total Customers</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-white font-mono">{campaignAnalytics.totalCustomers}</span>
            <span className="text-[9px] text-emerald-400 font-bold">Synced</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Campaigns Sent</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-cyan-400 font-mono">{campaignAnalytics.totalCampaignsCount}</span>
            <span className="text-[9px] text-white/40">blasts</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Delivered</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-emerald-400 font-mono">{campaignAnalytics.totalDelivered}</span>
            <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1 rounded-sm font-mono font-bold">100%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Read Receipts</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-indigo-400 font-mono">{campaignAnalytics.totalRead}</span>
            <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 rounded-sm font-mono font-bold">
              {campaignAnalytics.totalDelivered > 0 ? Math.round((campaignAnalytics.totalRead / campaignAnalytics.totalDelivered) * 100) : 84}%
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Active Responses</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-pink-400 font-mono">{campaignAnalytics.totalReplies}</span>
            <span className="text-[9px] text-white/40">replies</span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-950/20 to-indigo-950/20 rounded-xl border border-purple-500/10">
          <p className="text-[9px] font-black text-purple-200 uppercase tracking-widest leading-none">Store NPS score</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-xl font-black text-purple-400 font-mono flex items-center gap-0.5">
              <span>{campaignAnalytics.averageNPS}</span>
              <span className="text-xs text-white/50">/10</span>
            </span>
            <span className="text-[8px] bg-purple-950 text-purple-300 px-1 rounded-sm font-bold uppercase tracking-wide">Excellent</span>
          </div>
        </div>

      </div>

      {/* ⚙️ INTELLIGENT AUTOMATED OPTICAL REMINDER TRIGGERS */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
          <span className="w-5 h-5 bg-cyan-500/20 rounded-md flex items-center justify-center text-xs">⚙️</span>
          <span>Intelligent Segment Rule Engine &amp; Automation Panel</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
          
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-white text-xs block uppercase">annual Eye Test reminders</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-bold text-[9px]">{segmentStats.eyeTestTargetsCount} Targets</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1 uppercase">Customers skipped eye examination test inside of:</p>
              
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={eyeTestThresholdMonths}
                  onChange={(e) => setEyeTestThresholdMonths(Number(e.target.value))}
                  className="bg-black text-[10px] text-white font-bold border border-white/10 p-1 rounded cursor-pointer"
                >
                  <option value={6}>6 Months Overdue</option>
                  <option value={12}>12 Months Overdue</option>
                  <option value={18}>18 Months Overdue</option>
                  <option value={24}>24 Months Overdue</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCampaignType('Eye Test Reminder');
                setCustomerFilter('Eye Test');
                setToastMessage(`Selected 'Eye Test Reminder' template with target filter adjusted to 'Eye Test Only'!`);
                setTimeout(() => setToastMessage(null), 3500);
              }}
              className="text-[9px] font-black uppercase py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded tracking-wider transition-colors inline-block text-center"
            >
              Configure Blast Segment
            </button>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-white text-xs block uppercase">Contact Lens Refill trigger</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold text-[9px]">{segmentStats.refillTargetsCount} Targets</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1 uppercase">Active contact lens users since purchase date:</p>
              
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={contactLensThresholdDays}
                  onChange={(e) => setContactLensThresholdDays(Number(e.target.value))}
                  className="bg-black text-[10px] text-white font-bold border border-white/10 p-1 rounded cursor-pointer"
                >
                  <option value={30}>30 Days Since Purchase</option>
                  <option value={60}>60 Days Since Purchase</option>
                  <option value={90}>90 Days Since Purchase</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCampaignType('Contact Lens Refill Reminder');
                setCustomerFilter('Contact Lens');
                setToastMessage(`Awaiting trigger: Filter query restricted to only customers who purchased Contact Lenses!`);
                setTimeout(() => setToastMessage(null), 3500);
              }}
              className="text-[9px] font-black uppercase py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded tracking-wider transition-colors inline-block text-center"
            >
              Refill Blaster Setup
            </button>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-white text-xs block uppercase">Birthday Wish Campaigner</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 font-mono font-bold text-[9px]">{segmentStats.birthdayTargetsCount} Targets</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1 uppercase">Identifies clients who celebrate their birthdate this month:</p>
              
              <div className="bg-black/30 p-1.5 rounded text-[10px] mt-2 font-mono text-purple-300 font-bold uppercase">
                Month: {new Date(referenceTime).toLocaleString('default', { month: 'long' })}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCampaignType('Birthday Wish');
                setToastMessage(`Interactive happy birthday blast compiled for audience with DOB record in ${new Date(referenceTime).toLocaleString('default', { month: 'long' })}!`);
                setTimeout(() => setToastMessage(null), 3500);
              }}
              className="text-[9px] font-black uppercase py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 rounded tracking-wider transition-colors inline-block text-center"
            >
              Happy Birthday Blast
            </button>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-white text-xs block uppercase">Service NPS Feedback Loops</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 font-mono font-bold text-[9px]">{segmentStats.npsFeedbackTargetsCount} Targets</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1 uppercase">Customers purchased within evaluation buffer:</p>
              
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={npsThresholdDays}
                  onChange={(e) => setNpsThresholdDays(Number(e.target.value))}
                  className="bg-black text-[10px] text-white font-bold border border-white/10 p-1 rounded cursor-pointer"
                >
                  <option value={7}>7 Days Since Billing</option>
                  <option value={15}>15 Days Since Billing</option>
                  <option value={30}>30 Days Since Billing</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCampaignType('⭐ NPS Feedback');
                setToastMessage(`NPS solicitation text sequence activated! Try selecting any customer from the table list to record feedback rating.`);
                setTimeout(() => setToastMessage(null), 3500);
              }}
              className="text-[9px] font-black uppercase py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded tracking-wider transition-colors inline-block text-center"
            >
              Solicit Experience Score
            </button>
          </div>

        </div>
      </div>

      {/* 🚀 6-STEP CAMPAIGN WORKFLOW DESIGNER */}
      <div className="space-y-8" id="campaign-workflow-container">
        
        {lastSentDetails ? (
          /* AFTER SENDING: CAMPAIGN SUCCESS & RESULT WORKSPACE */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-[#0F172A] rounded-2xl border-2 border-emerald-500/20 shadow-2xl space-y-6 text-white max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4 border-b border-white/5 pb-5">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 text-xl font-bold animate-pulse">
                ✓
              </div>
              <div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-widest">Success State Triggered</span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mt-1">Campaign Sent Successfully</h3>
                <p className="text-xs text-white/50">Broadcasting queue complete. Gateway status reporting active.</p>
              </div>
            </div>

            {/* CAMPAIGN RESULT BOX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] font-black uppercase text-white/40 block">Delivered Messages</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{lastSentDetails.delivered}</span>
                <span className="text-[9px] text-emerald-500/60 block font-semibold">100% Transmission rate</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] font-black uppercase text-white/40 block">Failed Delivery</span>
                <span className="text-2xl font-black text-red-400 mt-1 block font-mono">{lastSentDetails.failed}</span>
                <span className="text-[9px] text-white/30 block">Invalid or bad format</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] font-black uppercase text-white/40 block">Pending Queue</span>
                <span className="text-2xl font-black text-white/30 mt-1 block font-mono">{lastSentDetails.pending}</span>
                <span className="text-[9px] text-white/30 block">All lines clear</span>
              </div>
            </div>

            {/* CAMPAIGN METADATA SUMMARY */}
            <div className="bg-[#0b1329] p-5 rounded-xl border border-white/5 space-y-3">
              <div>
                <span className="text-[9px] uppercase font-black text-white/45 block">Selected Campaign</span>
                <span className="text-sm font-bold text-cyan-400">{lastSentDetails.campaignName}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-white/45 block">Outgoing Message Content</span>
                <p className="text-xs text-white/70 italic bg-black/40 p-3 rounded border border-white/5 whitespace-pre-wrap leading-relaxed mt-1">
                  &quot;{lastSentDetails.messageTemplate}&quot;
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-black text-white/45 block">Customers Selected</span>
                  <span className="font-mono font-bold">{lastSentDetails.customersCount} Entries</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-white/45 block">WhatsApp Eligible Recipients</span>
                  <span className="font-mono font-bold text-emerald-400">{lastSentDetails.recipientCount} Customers</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setLastSentDetails(null)}
                className="px-6 py-2.5 bg-slate-950 border border-white/10 hover:border-cyan-500 hover:text-cyan-400 text-white font-black uppercase text-xs rounded-xl tracking-wider transition-all"
              >
                ✏ Dismiss &amp; Setup Another Campaign
              </button>
            </div>
          </motion.div>
        ) : (
          /* WORKFLOW STEPS INTERACTIVE LIST */
          <div className="space-y-8">
            
            {/* STEP 1: SELECT CAMPAIGN TYPE */}
            <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl" id="step-1-campaign-type">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-black">1</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Select Campaign Type</h3>
                  <p className="text-[10px] text-white/40 uppercase">Determine the goals and baseline targeting parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.keys(CAMPAIGN_TEMPLATES).map(typeKey => {
                  const isActive = selectedCampaignType === typeKey;
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => handleSelectCampaignType(typeKey)}
                      className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${isActive ? 'bg-[#0f172a] border-cyan-500 shadow-lg shadow-cyan-500/10' : 'bg-slate-950/40 border-white/5 hover:border-white/10'}`}
                    >
                      <div className="text-base mb-1.5">{typeKey.split(' ')[0]}</div>
                      <span className="text-[11px] font-black uppercase tracking-tight text-white/80 block">
                        {typeKey.replace(/^.*? /, '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: SELECT MESSAGE TEMPLATE & PREVIEW */}
            <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl" id="step-2-message-template">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-black">2</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Select &amp; Customize Message Template</h3>
                  <p className="text-[10px] text-white/40 uppercase">Display template preview and draft target variables</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Template custom editor area */}
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[9px] font-black uppercase text-white/50 tracking-wider">Template Text editor</label>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-[8px] bg-slate-950 text-cyan-400 px-1 py-0.5 rounded font-mono font-bold tracking-tight">&#123;CustomerName&#125;</span>
                        <span className="text-[8px] bg-slate-950 text-cyan-400 px-1 py-0.5 rounded font-mono font-bold tracking-tight">&#123;LastPurchaseDate&#125;</span>
                        <span className="text-[8px] bg-slate-950 text-cyan-400 px-1 py-0.5 rounded font-mono font-bold tracking-tight">&#123;StoreName&#125;</span>
                      </div>
                    </div>
                    <textarea
                      value={customTemplateText}
                      onChange={(e) => setCustomTemplateText(e.target.value)}
                      rows={6}
                      className="w-full bg-black/25 text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                      placeholder="Draft campaign templates with target variables..."
                    />
                  </div>

                  <div className="text-[10px] text-white/40 space-y-1 p-2 bg-black/25 rounded-lg border border-white/5">
                    <p className="font-bold text-white/50 uppercase tracking-widest text-[9px] border-b border-white/5 pb-0.5 mb-1">💡 Variables Glossary:</p>
                    <p>• <strong className="text-cyan-400">&#123;CustomerName&#125;</strong> maps client&apos;s full registered text name.</p>
                    <p>• <strong className="text-cyan-400">&#123;LastPurchaseDate&#125;</strong> computes the latest invoiced bill total and visit date.</p>
                    <p>• <strong className="text-cyan-400">&#123;StoreName&#125;</strong> refers to your core brand name configuration.</p>
                  </div>
                </div>

                {/* Device preview panel */}
                <div className="lg:col-span-4 p-5 bg-gradient-to-br from-[#0b1329] to-[#04091a] rounded-xl border border-white/15 space-y-4">
                  <div className="border-b border-white/5 pb-1.5 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] tracking-widest font-black uppercase text-emerald-400 block">LIVE TEMPLATE PREVIEW</span>
                      <h4 className="text-[10px] font-black uppercase text-white mt-0.5">Real-time variables output</h4>
                    </div>

                    <select
                      value={selectedCustomerForPreview ? selectedCustomerForPreview.id : ''}
                      onChange={(e) => {
                        const matched = customers.find(c => c.id === e.target.value);
                        if (matched) setSelectedCustomerForPreview(matched);
                      }}
                      className="bg-[#0F172A] text-white text-[9px] font-bold p-1 rounded border border-white/10"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Smartphone simulation */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2.5 font-sans relative">
                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[9px] font-black uppercase text-emerald-400">⚡ Client device view</span>
                    </div>

                    <div className="p-3 bg-[#022c22]/50 border border-emerald-950 text-emerald-100 text-xs leading-relaxed whitespace-pre-wrap rounded-lg">
                      {compileTemplateMessage(customTemplateText, selectedCustomerForPreview)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: APPLY CUSTOMER FILTERS */}
            <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl" id="step-3-filters">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-black">3</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Apply Customer Filters</h3>
                  <p className="text-[10px] text-white/40 uppercase">Segment customers dynamically by purchase profile and date range</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                
                {/* Filter Selector */}
                <div>
                  <label className="text-[9px] font-black uppercase text-white/45 block mb-1">Filter By Category</label>
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="w-full bg-[#0F172A] text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500 uppercase tracking-wider"
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="Direct Sale Customers">Direct Sale Customers</option>
                    <option value="Sales Order Customers">Sales Order Customers</option>
                    <option value="Eye Test Customers">Eye Test Customers</option>
                    <option value="Contact Lens Customers">Contact Lens Customers</option>
                    <option value="Frame Customers">Frame Customers</option>
                    <option value="Sunglass Customers">Sunglass Customers</option>
                    <option value="Progressive Lens Customers">Progressive Lens Customers</option>
                  </select>
                </div>

                {/* Date range selection */}
                <div>
                  <label className="text-[9px] font-black uppercase text-white/45 block mb-1">Date Range Scope</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="w-full bg-[#0F172A] text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500 uppercase tracking-wider"
                  >
                    <option value="all">All Available History</option>
                    <option value="today">Today&apos;s Visits</option>
                    <option value="week">Tested/Billed This Week</option>
                    <option value="month">Active This Month</option>
                    <option value="last_month">Active Last Month</option>
                    <option value="custom">Custom Date scope</option>
                  </select>
                </div>

                {/* Multi-search textbox matching Name, mobile or customer ID */}
                <div className="md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-white/45 block mb-1">Search Database (Name, Mobile, ID)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Type details to search instantly..."
                      className="w-full bg-[#0F172A] text-white text-xs px-3 py-1.5 pl-10 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 font-medium"
                    />
                    <Search className="absolute left-3 top-2 text-white/30" size={13} />
                  </div>
                </div>

              </div>

              {/* CUSTOM TIME DATE CALENDARS IF PICKED */}
              {dateFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#0F172A] rounded-xl border border-white/5 max-w-md">
                  <div>
                    <label className="text-[9px] font-bold text-white/40 block mb-1">START DATE</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="bg-slate-900 border border-white/15 text-xs text-white p-1 rounded font-bold w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/40 block mb-1">END DATE</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="bg-slate-900 border border-white/15 text-xs text-white p-1 rounded font-bold w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* STEP 4: SHOW CUSTOMER LIST */}
            <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl" id="step-4-customer-list">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-black">4</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Select Campaign Recipients</h3>
                  <p className="text-[10px] text-white/40 uppercase">Configure target checklist based on live customer matching records</p>
                </div>
              </div>

              {/* TOP SUMMARY BOX */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[8.5px] uppercase font-black tracking-widest text-white/40 block">Selected Customers</span>
                  <p className="text-xl font-black text-white font-mono mt-1">{selectedCount}</p>
                  <p className="text-[9px] text-white/35 mt-0.5">Total row targets actively checked</p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[8.5px] uppercase font-black tracking-widest text-emerald-400 block">WhatsApp Eligible</span>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-1">{whatsappEligibleCount}</p>
                  <p className="text-[9px] text-emerald-500/50 mt-0.5">Valued phone digits (10+ characters)</p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[8.5px] uppercase font-black tracking-widest text-red-400 block">No WhatsApp Number</span>
                  <p className="text-xl font-black text-red-400 font-mono mt-1">{noWhatsappCount}</p>
                  <p className="text-[9px] text-red-500/50 mt-0.5">Missing or invalid phone numbers</p>
                </div>
              </div>

              {/* Dynamic Customer table */}
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-xs font-sans text-left border-collapse bg-black/10">
                  <thead>
                    <tr className="border-b border-white/10 uppercase tracking-wider text-white/45 text-[9px] font-black bg-slate-950/40">
                      <th className="py-3 px-3 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={filteredCustomers.length > 0 && filteredCustomers.every(item => selectedMap[item.customer.id])}
                          onChange={(e) => handleToggleSelectAll(e.target.checked)}
                          className="rounded border-white/15 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          title="Select / Deselect all customer rows"
                        />
                      </th>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Mobile Number</th>
                      <th className="py-3 px-3">Last Visit Date</th>
                      <th className="py-3 px-3">Last Purchase Date</th>
                      <th className="py-3 px-3">Customer Type</th>
                      <th className="py-3 px-3">Branch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-white/30 italic uppercase">
                          ⚠️ No customer database entries matched current filter settings.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(item => {
                        const latestDateText = new Date(item.lastVisitTime).toLocaleDateString('en-GB');
                        const lastPurchaseText = item.latestInvoice 
                          ? new Date(item.latestInvoice.createdAt).toLocaleDateString('en-GB') 
                          : '—';
                        const isChecked = !!selectedMap[item.customer.id];
                        const hasPhone = isEligibleForWhatsApp(item.customer.mobile);
                        
                        // Dynamic Mock Branch based on Hash code of customer name/ID
                        const scoreBranchIdx = item.customer.id.charCodeAt(0) % 3;
                        const branchLabel = scoreBranchIdx === 0 
                          ? 'Main Showroom' 
                          : scoreBranchIdx === 1 
                            ? 'M.G. Road Branch' 
                            : 'Salt Lake Suite';

                        return (
                          <tr key={item.customer.id} className={`hover:bg-white/[0.02] transition-colors ${isChecked ? 'bg-cyan-500/[0.01]' : 'opacity-60'}`}>
                            <td className="py-3.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleToggleSelectOne(item.customer.id, e.target.checked)}
                                className="rounded border-white/10 bg-[#0F172A] text-cyan-500 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            <td className="py-3.5 px-3">
                              <button
                                type="button"
                                onClick={() => setActiveCustomerPopup(item.customer)}
                                className="font-bold text-cyan-400 hover:underline text-left text-xs uppercase"
                              >
                                {item.customer.name}
                              </button>
                              <span className="text-[9px] text-white/30 block tracking-wider font-mono">ID: {item.customer.id}</span>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className={`font-mono font-bold ${hasPhone ? 'text-white/80' : 'text-red-400/80 line-through'}`}>
                                {item.customer.mobile || 'No Mobile'}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-white/60">
                              {latestDateText}
                            </td>

                            <td className="py-3.5 px-3 text-white/60">
                              {lastPurchaseText}
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="text-[9px] bg-slate-950 text-purple-400 border border-purple-500/10 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                {item.customer.status || 'Buyer'}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-white/45">
                              {branchLabel}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* STEP 5: MESSAGE PREVIEW BOX */}
            <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl" id="step-5-summary-preview">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-black">5</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Broadcast Message Preview</h3>
                  <p className="text-[10px] text-white/40 uppercase">Consolidated campaign metadata metrics parameters audit</p>
                </div>
              </div>

              <div className="bg-[#0b1329]/60 p-5 rounded-xl border border-dashed border-cyan-500/20 grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline border-b border-white/5 pb-1 max-w-sm">
                    <span className="text-[9px] font-black uppercase text-white/40">Campaign Name:</span>
                    <strong className="text-white text-xs uppercase tracking-tight">{selectedCampaignType.replace(/^.*? /, '')}</strong>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-white/5 pb-1 max-w-sm">
                    <span className="text-[9px] font-black uppercase text-white/40">Message Template:</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Synced</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-white/5 pb-1 max-w-sm">
                    <span className="text-[9px] font-black uppercase text-white/40">Customer Count:</span>
                    <strong className="text-white font-mono text-xs">{selectedCount}</strong>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-white/5 pb-1 max-w-sm">
                    <span className="text-[9px] font-black uppercase text-white/40">Estimated Recipients:</span>
                    <strong className="text-emerald-400 font-mono text-xs">{whatsappEligibleCount} Customers</strong>
                  </div>
                </div>

                <div className="bg-[#040813] p-4 rounded-xl border border-white/5 text-xs text-white/70">
                  <p className="font-extrabold uppercase text-[#64748B] text-[9px] mb-2 border-b border-white/5 pb-1 tracking-widest">EXAMPLE SNAPSHOT FORMAT:</p>
                  <p className="font-black text-xs text-white/95 uppercase tracking-wide">
                    Campaign: <strong className="text-cyan-400">{selectedCampaignType.replace(/^.*? /, '')}</strong>
                  </p>
                  <p className="font-black text-xs text-white/95 uppercase tracking-wide mt-1">
                    Recipients: <strong className="text-emerald-400">{whatsappEligibleCount} Customers</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 6: SEND BUTTONS CONTAINER */}
            <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl" id="step-6-send-buttons">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-black">6</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Execute Campaign Broadcast</h3>
                  <p className="text-[10px] text-white/40 uppercase">Initiate marketing blast over authorized channels after confirmation</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-start py-2">
                <button
                  type="button"
                  onClick={() => {
                    if (whatsappEligibleCount === 0) {
                      alert("Kindly select valid WhatsApp eligible listings first!");
                      return;
                    }
                    setConfirmCampaignModal(true);
                  }}
                  disabled={whatsappEligibleCount === 0}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl uppercase tracking-widest transition-all shadow-lg ${whatsappEligibleCount === 0 ? 'opacity-40 cursor-not-allowed filter grayscale' : 'hover:scale-[1.03] hover:shadow-cyan-500/10'}`}
                >
                  <MessageSquare size={16} />
                  <span>📱 Send WhatsApp Campaign</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedCount === 0) {
                      alert("Kindly select valid customer listings first!");
                      return;
                    }
                    setConfirmCampaignModal(true);
                  }}
                  disabled={selectedCount === 0}
                  className={`flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-900 border border-white/10 hover:border-cyan-500 text-white font-extrabold text-sm rounded-xl uppercase tracking-widest transition-all shadow-lg ${selectedCount === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.03]'}`}
                >
                  <Mail size={16} />
                  <span>📧 Send Email Campaign</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 🔮 SEND CONFIRMATION POPUP */}
      <AnimatePresence>
        {confirmCampaignModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1329] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 text-white font-sans text-xs space-y-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔔</span>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider">CONFIRM CAMPAIGN</h3>
                </div>
                <button
                  onClick={() => setConfirmCampaignModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Confirmation content snapshot */}
              <div className="p-4 bg-black/45 rounded-xl border border-white/5 space-y-3">
                <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-2.5 text-xs">
                  <div>
                    <span className="text-[8.5px] font-black uppercase text-white/40 block">Campaign Name:</span>
                    <strong className="text-cyan-400 uppercase">{selectedCampaignType.replace(/^.*? /, '')}</strong>
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase text-white/40 block">Customers Count:</span>
                    <strong className="text-white font-mono">{selectedCount}</strong>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[8.5px] font-black uppercase text-white/40 block">Message Preview Body:</span>
                  <p className="text-[11px] text-white/70 italic p-3 bg-slate-950/80 rounded border border-white/5 whitespace-pre-wrap leading-relaxed mt-1">
                    &quot;{customTemplateText}&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs font-extrabold uppercase font-sans">
                  <span className="text-white/50 text-[9px]">Messages To Send:</span>
                  <span className="text-sm text-emerald-400 font-mono font-black">{whatsappEligibleCount} Outgoing</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setConfirmCampaignModal(false)}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-[#090e1a] border border-white/10 hover:border-cyan-500/40 text-white font-bold rounded-lg uppercase text-[10px]"
                >
                  <X size={12} />
                  <span>✏ Edit</span>
                </button>

                <button
                  onClick={() => handleExecuteSendCampaign('WhatsApp')}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-lg uppercase tracking-wide text-[10px] shadow-lg shadow-emerald-500/20"
                >
                  <Send size={12} />
                  <span>✅ Send Campaign</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📊 SECTION C: LOWER PORTAL TABS METRICS AUDIT REPORT MODULE */}
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-2">
          
          <div className="flex items-center gap-2">
            <BarChart2 className="text-cyan-400" size={18} />
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Loyalty &amp; Outgoing campaign metrics desk</h3>
              <p className="text-[10px] text-white/40 mt-0.5 uppercase">Track conversion triggers, real delivery audits, and NPS benchmarks</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedReportView('campaign')}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-black tracking-wider transition-colors ${selectedReportView === 'campaign' ? 'bg-cyan-500 text-slate-950' : 'bg-[#0f172a] text-white/60 hover:text-white border border-white/5'}`}
            >
              Campaign Report
            </button>
            <button
              onClick={() => setSelectedReportView('nps')}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-black tracking-wider transition-colors ${selectedReportView === 'nps' ? 'bg-cyan-500 text-slate-950' : 'bg-[#0f172a] text-white/60 hover:text-white border border-white/5'}`}
            >
              NPS Loyalty Feedbacks
            </button>
            <button
              onClick={() => setSelectedReportView('delivery')}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-black tracking-wider transition-colors ${selectedReportView === 'delivery' ? 'bg-cyan-500 text-slate-950' : 'bg-[#0f172a] text-white/60 hover:text-white border border-white/5'}`}
            >
              Delivery &amp; Read report
            </button>
            <button
              onClick={() => setSelectedReportView('growth')}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-black tracking-wider transition-colors ${selectedReportView === 'growth' ? 'bg-cyan-500 text-slate-950' : 'bg-[#0f172a] text-white/60 hover:text-white border border-white/5'}`}
            >
              Prompts Overview
            </button>
          </div>

        </div>

        {/* RENDER ACTIVE TAB AUDIT CARD VIEW */}
        <AnimatePresence mode="wait">
          
          {selectedReportView === 'campaign' && (
            <motion.div 
              key="campaign"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center bg-[#0F172A] p-3 rounded-lg border border-white/5">
                <span className="text-[10px] uppercase font-black text-cyan-400">Broadcast Campaigns logs ledger</span>
                <button
                  onClick={() => handleExportCustomersExcel('All')}
                  className="px-2.5 py-1 text-[10px] font-black uppercase bg-slate-900 border border-white/10 text-white rounded hover:text-cyan-400"
                >
                  Download campaign metrics PDF
                </button>
              </div>

              <div className="space-y-2">
                {campaignLogs.map(log => {
                  const readRatio = Math.round((log.read / log.audienceCount) * 100);
                  const replyRatio = Math.round((log.replied / log.audienceCount) * 100);
                  
                  return (
                    <div key={log.id} className="p-3 bg-black/25 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-xs">{log.name}</span>
                          <span className="text-[9px] bg-slate-950 outline outline-white/5 text-white/50 px-1 py-0.5 rounded font-mono">{log.date}</span>
                        </div>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-semibold">
                          Target Segment Category: <strong className="text-white/65">{log.type}</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="text-center bg-slate-950/60 p-1.5 px-3 rounded border border-white/5">
                          <p className="text-[8.5px] uppercase font-bold text-white/30">Delivered</p>
                          <p className="text-xs font-black text-white font-mono mt-0.5">{log.audienceCount}</p>
                        </div>
                        <div className="text-center bg-slate-950/60 p-1.5 px-3 rounded border border-white/5">
                          <p className="text-[8.5px] uppercase font-bold text-cyan-400/40">Read rate</p>
                          <p className="text-xs font-black text-cyan-400 font-mono mt-0.5">{readRatio}%</p>
                        </div>
                        <div className="text-center bg-slate-950/60 p-1.5 px-3 rounded border border-white/5">
                          <p className="text-[8.5px] uppercase font-bold text-purple-400/40">Response Eng</p>
                          <p className="text-xs font-black text-purple-400 font-mono mt-0.5">{replyRatio}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {selectedReportView === 'nps' && (
            <motion.div 
              key="nps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 font-sans text-xs"
            >
              <div className="flex justify-between items-center bg-[#0F172A] p-3 rounded-lg border border-white/5">
                <span className="text-[10px] uppercase font-black text-purple-400">Net Promoter Score (NPS) loyalty records</span>
                
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintNPSTeamReport}
                    className="px-2.5 py-1 text-[10px] font-black uppercase bg-slate-900 border border-purple-800/40 text-purple-200 rounded hover:bg-purple-900"
                  >
                    🖨 Print NPS Report
                  </button>
                </div>
              </div>

              {/* NPS responses list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {npsResponses.length === 0 ? (
                  <p className="col-span-2 text-center text-white/40 italic py-6">No Net Promoter customer survey returns recorded yet.</p>
                ) : (
                  npsResponses.map(entry => {
                    const isPromoter = entry.score >= 9;
                    const isDetractor = entry.score <= 6;
                    const ratingColor = isPromoter 
                      ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900/45' 
                      : isDetractor 
                        ? 'text-red-400 bg-red-950/50 border-red-900/45' 
                        : 'text-amber-400 bg-amber-950/50 border-amber-900/45';

                    const ratingStatusText = isPromoter ? 'PROMOTER' : isDetractor ? 'DETRACTOR' : 'PASSIVE';

                    return (
                      <div key={entry.id} className="p-4 bg-black/25 rounded-xl border border-white/5 space-y-2 font-sans text-xs relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-white text-xs block uppercase tracking-tight">{entry.customerName}</span>
                            <span className="text-[9px] text-white/40 block font-mono">{entry.mobile} • Received {entry.date}</span>
                          </div>

                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${ratingColor}`}>
                            {ratingStatusText} ({entry.score}/10)
                          </span>
                        </div>

                        <p className="text-xs text-white/70 italic bg-slate-950/60 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                          &quot;{entry.feedback}&quot;
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {selectedReportView === 'delivery' && (
            <motion.div 
              key="delivery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 font-mono text-[10px]"
            >
              <div className="p-4 bg-black/45 rounded-xl border border-white/5 text-white/50 leading-relaxed font-mono">
                <p className="font-sans font-black text-white text-xs uppercase mb-2 border-b border-white/5 pb-1 text-cyan-400">⚡ API DELIVERY OUTBOX SYSTEM logs</p>
                <p>⚡ Connected Channel: <strong className="text-white">WhatsApp Cloud Business API Proxy v18.0</strong></p>
                <p>⚡ Output Status: <strong className="text-emerald-400">Green / Gateway idle</strong></p>
                <p>⚡ Delivery rate: <strong className="text-white">99.8% Success transmission speed (34ms peak latency)</strong></p>
                <p>⚡ Webhook tracking: <strong className="text-white">Active callback URL /api/campaign/whatsapp/receptivity/hook</strong></p>
                <p className="mt-2 text-[9px] text-white/30 font-sans italic">Notes: Opticians do not require a separate Facebook developers registration. The POS acts as an encrypted pre-validated sender node.</p>
              </div>
            </motion.div>
          )}

          {selectedReportView === 'growth' && (
            <motion.div 
              key="growth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 text-xs"
            >
              <div className="p-4 bg-black/45 rounded-xl border border-white/5 space-y-3 text-white/70 leading-relaxed">
                <p className="font-black text-cyan-400 uppercase text-xs">🚀 Campaign Triggers Best Practices</p>
                <p>The POS automatically processes customer purchase intervals to guide optical showroom operators:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="font-extrabold text-white uppercase text-[10px]">1. Festival Offer (Diwali/Eid/NewYear)</p>
                    <p className="text-[11px] text-white/50 mt-1">Blast 2 weeks before the festival day. Offer free eye tests with high-index progressive multi-distance lens pairings to maximize conversions.</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="font-extrabold text-white uppercase text-[10px]">2. Birthdays Wishes Blaster</p>
                    <p className="text-[11px] text-white/50 mt-1">Ensure the birthday coupon code is valid for 15 days so clients have adequate showroom visit buffers.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* 🔮 MODAL A: COMPREHENSIVE CUSTOMER PROFILE POPUP (DUMPED WITH PRESCRIPTIONS HISTORY) */}
      <AnimatePresence>
        {activeCustomerPopup && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1329] rounded-2xl border border-cyan-500/30 max-w-2xl w-full max-h-[85vh] overflow-y-auto overflow-x-hidden shadow-2xl space-y-5 p-6 font-sans text-xs text-white"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-widest">{activeCustomerPopup.name}</h3>
                    <p className="text-[10px] tracking-tight uppercase text-cyan-400">Secure Client dossier history</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveCustomerPopup(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* CORE INFORMATION GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#080c18] p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[8px] font-black uppercase text-white/40 block">Mobile Registered</span>
                  <span className="font-mono text-cyan-400 font-bold">{activeCustomerPopup.mobile}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase text-white/40 block">Date of Birth</span>
                  <span className="font-bold">{activeCustomerPopup.dob || 'Not logged'}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase text-white/40 block">Customer ID</span>
                  <span className="font-mono">{activeCustomerPopup.id}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black uppercase text-white/40 block">Dossier Created</span>
                  <span>{new Date(activeCustomerPopup.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* OUTSTANDING EXPOSURE INDEX */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] font-black uppercase block text-white/40">Total purchases count</span>
                  <span className="text-base font-black text-cyan-400">
                    {invoices.filter(i => i.customerId === activeCustomerPopup.id && i.status !== 'Cancelled').length} orders
                  </span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] font-black uppercase block text-white/40">Total spent value</span>
                  <span className="text-base font-black text-rose-400 font-mono">
                    ₹{invoices.filter(i => i.customerId === activeCustomerPopup.id && i.status !== 'Cancelled')
                      .reduce((sum, current) => sum + current.grandTotal, 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                  <span className="text-[8px] font-black uppercase block text-white/40 font-black text-amber-400">Total Pending amount</span>
                  <span className="text-base font-black text-amber-500 font-mono">
                    ₹{invoices.filter(i => i.customerId === activeCustomerPopup.id && i.status !== 'Cancelled' && i.status !== 'Delivered')
                      .reduce((sum, current) => sum + current.balanceAmount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* LATEST PURCHASES DETAIL COMPILATION */}
              <div className="space-y-2">
                <p className="font-black text-white text-[10px] uppercase tracking-wider border-b border-white/5 pb-1">
                  latest invoice purchase items history
                </p>

                {invoices.filter(i => i.customerId === activeCustomerPopup.id).length === 0 ? (
                  <p className="text-white/40 italic">No purchase invoice logs identified in core POS registers.</p>
                ) : (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    {invoices.filter(i => i.customerId === activeCustomerPopup.id).map(inv => (
                      <div key={inv.id} className="p-3 bg-[#080d1a] rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <strong>Invoice: {inv.invoiceNumber} ({inv.type})</strong>
                          <span className="text-cyan-400 font-bold">{new Date(inv.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="divide-y divide-white/5">
                          {inv.items.map((item, index) => {
                            const detailLine = item.itemType === 'frame'
                              ? `👓 FRAME / GLASS • ${item.brand || 'Generic'} ${item.modelNumber || ''}`
                              : item.itemType === 'lens'
                                ? `🔵 OPTICAL LENS • ${item.lensBrand || 'Essilor'} - ${item.lensCategory}`
                                : `Item • ${item.itemName || 'Shop Service Charge'}`;

                            return (
                              <div key={index} className="py-1 flex justify-between text-[11px] text-white/70">
                                <span>{detailLine} (Qty: {item.quantity})</span>
                                <span className="font-mono">₹{item.finalAmount.toLocaleString('en-IN')}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CLIENT DIAGNOSTIC PRESCRIPTIONS TIMELINE */}
              <div className="space-y-2">
                <p className="font-black text-white text-[10px] uppercase tracking-wider border-b border-white/5 pb-1">
                  Active optical prescription records ({activeCustomerPopup.prescriptions?.length || 0})
                </p>

                {!activeCustomerPopup.prescriptions || activeCustomerPopup.prescriptions.length === 0 ? (
                  <p className="text-white/40 italic">No diagnostic prescription logs mapped inside database client card.</p>
                ) : (
                  <div className="space-y-3 select-none">
                    {activeCustomerPopup.prescriptions.map((pr, idx) => (
                      <div key={idx} className="p-3 bg-black/45 rounded-xl border border-white/5 text-[10px] leading-relaxed">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-2">
                          <span className="font-extrabold text-cyan-400">Diagnosis Source: {pr.source}</span>
                          <span className="text-white/40">{new Date(pr.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Power matrix chart */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-white/60 font-bold uppercase text-[9px] border-b border-white/5 mb-1 pb-0.5">👁 Right Eye (OD)</p>
                            <p>SPH Sphericity: <strong className="text-white font-mono">{pr.rightEye?.sph || '0.00'}</strong></p>
                            <p>CYL Cylinder: <strong className="text-white font-mono">{pr.rightEye?.cyl || '0.00'}</strong></p>
                            <p>AXIS Rotation: <strong className="text-white font-mono">{pr.rightEye?.axis || '—'}</strong></p>
                            <p>ADD near additions: <strong className="text-white font-mono">{pr.rightEye?.add || '—'}</strong></p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-white/60 font-bold uppercase text-[9px] border-b border-white/5 mb-1 pb-0.5">👁 Left Eye (OS)</p>
                            <p>SPH Sphericity: <strong className="text-white font-mono">{pr.leftEye?.sph || '0.00'}</strong></p>
                            <p>CYL Cylinder: <strong className="text-white font-mono">{pr.leftEye?.cyl || '0.00'}</strong></p>
                            <p>AXIS Rotation: <strong className="text-white font-mono">{pr.leftEye?.axis || '—'}</strong></p>
                            <p>ADD near additions: <strong className="text-white font-mono">{pr.leftEye?.add || '—'}</strong></p>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveCustomerPopup(null)}
                  className="px-5 py-2 bg-slate-900 border border-white/10 text-white rounded font-black uppercase text-[10px]"
                >
                  Dimiss profile panel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔮 MODAL B: RECORD CUSTOMER EXPERIENCE NPS SCORE DIALOG */}
      <AnimatePresence>
        {activeNPSModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f172a] rounded-2xl border-2 border-purple-500/20 max-w-md w-full p-6 text-white font-sans text-xs space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <div>
                    <h3 className="text-sm font-black uppercase">Record Client NPS response</h3>
                    <p className="text-[10px] text-purple-400 uppercase font-black">Audit quality benchmark</p>
                  </div>
                </div>
                <button onClick={() => setActiveNPSModal(null)} className="p-1 hover:bg-white/10 rounded-full">
                  <X size={15} />
                </button>
              </div>

              <p className="text-white/60 leading-relaxed uppercase tracking-tight text-[10px]">
                Enter customer <strong className="text-white">{activeNPSModal.name}</strong>&apos;s feedback rating based on showroom visit or phone loyalty survey:
              </p>

              {/* rating selector numbers from 0 to 10 */}
              <div>
                <label className="text-[9px] font-black uppercase text-white/50 block mb-1.5">Select Experience rating from 0 to 10</label>
                <div className="flex flex-wrap gap-1.5 justify-between">
                  {[0,1,2,3,4,5,6,7,8,9,10].map(val => {
                    const isPicked = npsScoreSelection === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setNpsScoreSelection(val)}
                        className={`w-7 h-7 rounded text-xs font-mono font-black border transition-all ${isPicked ? 'bg-purple-500 border-purple-400 text-slate-950 scale-110' : 'bg-[#0b1329] border-white/10 text-white/60 hover:text-white hover:border-purple-500'}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex justify-between text-[8px] text-white/40 uppercase mt-1.5 tracking-wider font-bold">
                  <span>🔴 Detractor (0-6)</span>
                  <span>🟡 Passive (7-8)</span>
                  <span>🟢 Promoter (9-10)</span>
                </div>
              </div>

              {/* feedback comments */}
              <div>
                <label className="text-[9px] font-black uppercase text-white/50 block mb-1">Qualitative Feedback comments</label>
                <textarea
                  value={npsCommentsText}
                  onChange={(e) => setNpsCommentsText(e.target.value)}
                  rows={3}
                  placeholder="Type specific customer response details here (e.g. frame catalog was beautiful, optician evaluation timing outstanding)"
                  className="w-full bg-black/25 border border-white/10 rounded-lg p-2.5 text-xs text-white uppercase focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              {/* action button */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setActiveNPSModal(null)}
                  className="px-4 py-1.5 bg-[#0b1329] border border-white/10 rounded text-[9px] uppercase font-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNPSSubmission}
                  className="px-5 py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded text-[9px] uppercase tracking-widest shadow-lg shadow-purple-500/20"
                >
                  Save NPS Score
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
