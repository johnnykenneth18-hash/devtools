// user dashboard.js - Complete Fixed Version
document.addEventListener("DOMContentLoaded", function () {
  // Supabase Configuration
  const SUPABASE_URL = "https://hqgphtfuefmhhbspfyly.supabase.co";
  const SUPABASE_KEY = "sb_publishable_EngdgjVpFsDu2rRDexBK1w_BldDZtLM";

  // Initialize Supabase client immediately
  const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log(
    "Supabase client initialized:",
    supabaseClient ? "Success" : "Failed"
  );

  // DOM Elements
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const adminLinks = document.querySelectorAll(
    "#admin-link, #admin-link-mobile, #admin-link-footer"
  );
  const adminLoginModal = document.getElementById("admin-login-modal");
  const closeModalButtons = document.querySelectorAll(".close-modal");
  const paymentModal = document.getElementById("payment-modal");
  const productsGrid = document.getElementById("products-grid");
  const loadingOverlay = document.getElementById("loading");
  const whatsappButtons = document.querySelectorAll(
    "#whatsapp-support, #whatsapp-support-mobile"
  );
  const exploreProductsBtn = document.getElementById("explore-products");
  const watchDemoBtn = document.getElementById("watch-demo");
  const adminLoginForm = document.getElementById("admin-login-form");

  // State variables
  let currentProduct = null;
  let selectedBank = null;
  let currentStep = 1;

  // Initialize the app
  initApp();

  async function initApp() {
    console.log("🚀 Initializing DevTools Pro...");

    try {
      window.currencyManager = new SafeCurrencyManager();
      await window.currencyManager.initialize();

      console.log(
        "💰 Currency set to:",
        window.currencyManager.userCurrency,
        window.currencyManager.currencySymbol
      );
      // 1. Add CSS styles first
      addProductCardStyles();
      addPaymentStyles();

      // 2. Setup event listeners
      setupEventListeners();

      // 4. Load and display products
      await loadProducts();

      // 5. Setup other components
      setupTestimonialSlider();
      setupCurrencySelectorUI();

      console.log("✅ App fully initialized");

      // Check if products are displayed
      setTimeout(() => {
        const productCards = document.querySelectorAll(".product-card");
        console.log(`🎯 Found ${productCards.length} product cards on page`);

        if (productCards.length === 0) {
          console.warn("⚠️ No product cards found! Checking products grid...");
          console.log("Products grid exists:", !!productsGrid);
          console.log(
            "Products grid HTML:",
            productsGrid?.innerHTML?.substring(0, 200)
          );
        }
      }, 1000);
    } catch (error) {
      console.error("❌ App initialization failed:", error);
      showErrorModal(
        "Failed to initialize application. Please refresh the page."
      );
    }
  }

  // Emergency fallback function
  async function loadProductsWithoutCurrency() {
    console.log("🆘 Loading products WITHOUT currency...");

    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    // Simple static products
    const mockProducts = [
      {
        id: 1,
        name: "SEO Analyzer Pro",
        description: "Advanced SEO analysis tool",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        featured: true,
      },
      {
        id: 2,
        name: "Code Optimizer",
        description: "Optimize JavaScript and CSS",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
        featured: false,
      },
    ];

    // Simple display
    productsGrid.innerHTML = mockProducts
      .map(
        (product) => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${
                  product.featured ? '<div class="featured">FEATURED</div>' : ""
                }
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">$${product.price.toFixed(2)}</div>
                <button class="btn-buy">Buy Now</button>
            </div>
        </div>
    `
      )
      .join("");

    console.log("🆘 Emergency products displayed");
  }

  function setupEventListeners() {
    // Mobile menu toggle
    if (menuToggle) {
      menuToggle.addEventListener("click", toggleMobileMenu);
    }

    // Admin login links
    adminLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        showAdminLogin();
      });
    });

    // Close modal buttons
    closeModalButtons.forEach((button) => {
      button.addEventListener("click", () => {
        closeAllModals();
      });
    });

    // Close modal when clicking outside
    if (adminLoginModal) {
      adminLoginModal.addEventListener("click", (e) => {
        if (e.target === adminLoginModal) {
          closeAllModals();
        }
      });
    }

    if (paymentModal) {
      paymentModal.addEventListener("click", (e) => {
        if (e.target === paymentModal) {
          closeAllModals();
        }
      });
    }

    // WhatsApp support buttons
    whatsappButtons.forEach((button) => {
      button.addEventListener("click", () => {
        window.open(
          "https://api.whatsapp.com/send?phone=12245376239&text=Hi%20DevTools%20Pro%20Support%2C%20I%20need%20assistance",
          "_blank"
        );
      });
    });

    // Explore products button
    if (exploreProductsBtn) {
      exploreProductsBtn.addEventListener("click", () => {
        document
          .querySelector("#products")
          .scrollIntoView({ behavior: "smooth" });
      });
    }

    // Watch demo button
    if (watchDemoBtn) {
      watchDemoBtn.addEventListener("click", () => {
        alert("Demo video would play here in production.");
      });
    }

    // Admin login form
    if (adminLoginForm) {
      adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("admin-email").value;
        const password = document.getElementById("admin-password").value;

        try {
          showLoading();

          if (
            email === "arinzeadmin@websell.com" &&
            password === "Arinze2002@"
          ) {
            setTimeout(() => {
              hideLoading();
              window.location.href = "admin.html";
            }, 1000);
          } else {
            throw new Error("Invalid credentials");
          }

          // For demo, simulate successful login
          setTimeout(() => {
            hideLoading();
            window.location.href = "admin.html";
          }, 1000);
        } catch (error) {
          hideLoading();
          showError("Invalid email or password");
        }
      });
    }
  }

  function toggleMobileMenu() {
    mobileMenu.classList.toggle("active");
    menuToggle.innerHTML = mobileMenu.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  }

  function showAdminLogin() {
    closeAllModals();
    if (adminLoginModal) {
      adminLoginModal.classList.add("active");
    }
  }

  function closeAllModals() {
    if (adminLoginModal) {
      adminLoginModal.classList.remove("active");
    }
    if (paymentModal) {
      paymentModal.classList.remove("active");
    }
    if (mobileMenu) {
      mobileMenu.classList.remove("active");
    }
    if (menuToggle) {
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
  }

  // Currency selector
  function setupCurrencySelector() {
    const selector = document.getElementById("currency-select");
    if (!selector) return;

    // Set current selection
    selector.value = userCurrency === "auto" ? "auto" : userCurrency;

    selector.addEventListener("change", async function () {
      const selectedCurrency = this.value;

      if (selectedCurrency === "auto") {
        // Auto detect
        await detectUserCurrency();
      } else {
        // Manual selection
        userCurrency = selectedCurrency;
        currencySymbol = getCurrencySymbol(selectedCurrency);
        exchangeRate = await getExchangeRate(selectedCurrency);

        localStorage.setItem("userCurrency", userCurrency);
        localStorage.setItem("currencySymbol", currencySymbol);
      }

      updateAllPrices();
      showSuccessModal(`Currency changed to ${userCurrency} ${currencySymbol}`);
    });
  }

  // ============ DISPLAY PRODUCTS FUNCTION ============

  async function displayProducts(products) {
    console.log("🔄 Displaying products...");

    if (!productsGrid) {
      console.error("❌ Products grid element not found!");
      return;
    }

    // Clear loading state
    productsGrid.innerHTML = "";

    if (!products || products.length === 0) {
      productsGrid.innerHTML = `
            <div class="no-products" style="text-align: center; padding: 3rem; color: #6c757d; grid-column: 1 / -1;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; color: var(--gray);"></i>
                <h3 style="color: var(--dark); margin-bottom: 0.5rem;">No products available</h3>
                <p>Check back soon for new tools!</p>
            </div>
        `;
      console.log("ℹ️ No products to display");
      return;
    }

    console.log(
      `📦 Displaying ${products.length} products in ${currencyManager.userCurrency}`
    );

    // Create product cards
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = `product-card ${
        product.featured ? "featured" : ""
      }`;

      // Get formatted price using currency manager
      const formattedPrice = currencyManager
        ? currencyManager.formatPrice(product.price)
        : `$${product.price.toFixed(2)}`;

      productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image || getDefaultImage()}" 
                     alt="${product.name}" 
                     onerror="this.onerror=null; this.src='${getDefaultImage()}'"
                     loading="lazy">
                ${
                  product.featured
                    ? '<div class="featured-badge"><i class="fas fa-star"></i> FEATURED</div>'
                    : ""
                }
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${
                  product.description || "No description available"
                }</p>
                <div class="product-price">
                    <div class="price" data-original-price="${product.price}">
                        ${formattedPrice}
                    </div>
                    <button class="btn-buy" data-product-id="${
                      product.id
                    }" data-product-name="${product.name}">
                        <i class="fas fa-shopping-cart"></i> Buy Now
                    </button>
                </div>
            </div>
        `;

      productsGrid.appendChild(productCard);

      // Add click event to buy button
      const buyButton = productCard.querySelector(".btn-buy");
      buyButton.addEventListener("click", () => {
        console.log(`🛒 Buying product: ${product.name}`);
        startPurchase(product);
      });
    });

    // Add hover effects and animations
    addProductCardAnimations();

    console.log("✅ Products displayed successfully");
  }

  // Helper function for default image
  function getDefaultImage() {
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
  }

  // Add animations to product cards
  function addProductCardAnimations() {
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach((card, index) => {
      // Staggered animation
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add("animate-in");

      // Hover effect
      card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-10px)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
      });
    });
  }

  // ============ UPDATED LOAD PRODUCTS FUNCTION ============

  async function loadProducts() {
    console.log("📥 Loading products...");
    showLoading();

    try {
      // Fetch products from Supabase
      const { data: products, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error loading products from Supabase:", error);
        // Fallback to mock data
        const mockProducts = getMockProducts();
        await displayProducts(mockProducts);
        return;
      }

      console.log(`✅ Loaded ${products?.length || 0} products from Supabase`);

      if (!products || products.length === 0) {
        console.log("ℹ️ No products found in database");
        await displayProducts([]);
        return;
      }

      // Format products for display
      const formattedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description || "No description available",
        price: parseFloat(product.price) || 0,
        image: product.image_url || getDefaultImage(),
        featured: product.featured || false,
      }));

      await displayProducts(formattedProducts);
    } catch (error) {
      console.error("❌ Error loading products:", error);
      // Fallback to mock data
      const mockProducts = getMockProducts();
      await displayProducts(mockProducts);
      showError("Failed to load products. Please try again later.");
    } finally {
      hideLoading();
    }
  }

  // Mock products for fallback
  function getMockProducts() {
    return [
      {
        id: 1,
        name: "SEO Analyzer Pro",
        description: "Advanced SEO analysis tool with competitor tracking",
        price: 49.99,
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        featured: true,
      },
      {
        id: 2,
        name: "Code Optimizer",
        description: "Automatically optimize your JavaScript and CSS code",
        price: 79.99,
        image:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        featured: false,
      },
      {
        id: 3,
        name: "Security Scanner",
        description: "Comprehensive web application security scanner",
        price: 129.99,
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        featured: true,
      },
      {
        id: 4,
        name: "Performance Monitor",
        description: "Real-time website performance monitoring",
        price: 89.99,
        image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        featured: false,
      },
    ];
  }

  // ============ CSS FOR PRODUCT CARDS ============

  function addProductCardStyles() {
    const style = document.createElement("style");
    style.textContent = `
        /* Product Grid */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        /* Product Card */
        .product-card {
            background: white;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(38, 70, 83, 0.05);
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 0.5s ease forwards;
        }
        
        .product-card.animate-in {
            animation: slideUp 0.5s ease forwards;
        }
        
        @keyframes slideUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .product-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(38, 70, 83, 0.1);
            border-color: rgba(42, 157, 143, 0.2);
        }
        
        /* Product Image */
        .product-image {
            position: relative;
            height: 200px;
            background: linear-gradient(135deg, #f1faee 0%, #e9f5db 100%);
            overflow: hidden;
        }
        
        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .product-card:hover .product-image img {
            transform: scale(1.05);
        }
        
        /* Featured Badge */
        .featured-badge {
            position: absolute;
            top: 15px;
            right: -30px;
            background: var(--accent);
            color: var(--dark);
            padding: 5px 30px;
            font-size: 0.8rem;
            font-weight: 600;
            transform: rotate(45deg);
            z-index: 1;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .featured-badge i {
            font-size: 0.7rem;
        }
        
        /* Product Info */
        .product-info {
            padding: 1.5rem;
        }
        
        .product-info h3 {
            font-size: 1.3rem;
            margin-bottom: 0.8rem;
            color: var(--dark);
            font-weight: 600;
            line-height: 1.3;
        }
        
        .product-description {
            color: var(--gray);
            margin-bottom: 1.5rem;
            line-height: 1.5;
            font-size: 0.95rem;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            min-height: 4.5em;
        }
        
        /* Product Price */
        .product-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
        }
        
        .price {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            transition: all 0.3s ease;
        }
        
        .price-updated {
            animation: pricePulse 0.5s ease;
        }
        
        @keyframes pricePulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        /* Buy Button */
        .btn-buy {
            background: var(--gradient);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 15px rgba(42, 157, 143, 0.2);
            white-space: nowrap;
        }
        
        .btn-buy:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(42, 157, 143, 0.3);
        }
        
        .btn-buy:active {
            transform: translateY(0);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .products-grid {
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1.5rem;
            }
            
            .product-info {
                padding: 1.2rem;
            }
            
            .product-info h3 {
                font-size: 1.2rem;
            }
            
            .product-description {
                font-size: 0.9rem;
                -webkit-line-clamp: 2;
                min-height: 3em;
            }
            
            .price {
                font-size: 1.3rem;
            }
            
            .btn-buy {
                padding: 8px 16px;
                font-size: 0.9rem;
            }
            
            .featured-badge {
                font-size: 0.7rem;
                padding: 4px 25px;
                top: 12px;
                right: -25px;
            }
        }
        
        @media (max-width: 480px) {
            .products-grid {
                grid-template-columns: 1fr;
            }
            
            .product-price {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            
            .btn-buy {
                width: 100%;
                justify-content: center;
            }
        }
    `;

    document.head.appendChild(style);
  }

  function startPurchase(product) {
    console.log("Starting purchase for product:", product);
    currentProduct = product;
    currentStep = 1;
    selectedBank = null;

    const productImage = document.getElementById("payment-product-image");
    const productName = document.getElementById("payment-product-name");
    const productPrice = document.getElementById("payment-product-price");
    const paymentAmount = document.getElementById("payment-amount");

    if (productImage) productImage.src = product.image;
    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = formatPrice(product.price);
    if (paymentAmount) paymentAmount.textContent = formatPrice(product.price);

    document.querySelectorAll(".payment-step").forEach((step) => {
      step.classList.remove("active");
    });
    const step1 = document.getElementById("step1");
    if (step1) step1.classList.add("active");

    document.querySelectorAll(".bank-option").forEach((option) => {
      option.classList.remove("selected");
    });

    closeAllModals();
    if (paymentModal) {
      paymentModal.classList.add("active");
    }

    setupPaymentFlow();
  }

  // ============ PAYMENT HELPER FUNCTIONS (DEFINE FIRST) ============

  function showErrorModal(message) {
    const errorModal = document.createElement("div");
    errorModal.className = "modal active";
    errorModal.innerHTML = `
        <div class="modal-content animate__animated animate__shakeX">
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Oops!</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="this.closest('.modal').remove()">
                    OK
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(errorModal);
  }

  function showSuccessModal(message) {
    const successModal = document.createElement("div");
    successModal.className = "modal active";
    successModal.innerHTML = `
        <div class="modal-content animate__animated animate__fadeInUp">
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h3>Success!</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="this.closest('.modal').remove()">
                    Continue
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(successModal);
  }

  function showProcessing(message) {
    const processingOverlay = document.createElement("div");
    processingOverlay.className = "processing-overlay active";
    processingOverlay.innerHTML = `
        <div class="processing-content">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;

    processingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
    `;

    processingOverlay.querySelector(".processing-content").style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        min-width: 300px;
    `;

    document.body.appendChild(processingOverlay);

    setTimeout(() => {
      if (processingOverlay.parentNode) {
        processingOverlay.remove();
      }
    }, 3000);

    return processingOverlay;
  }

  function generateOrderReference() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `DT${timestamp}${random}`;
  }

  function getBankFullName(bankCode) {
    const banks = {
      palmpay: "PalmPay",
      opay: "OPay",
      moniepoint: "Moniepoint",
      binance: "Binance Pay",
      ethereum: "Ethereum",
    };
    return banks[bankCode] || "Selected Payment Method";
  }

  // Update the updateBankInfo function for crypto
  function updateBankInfo(bankCode) {
    const bankInfo = {
      palmpay: {
        name: "PalmPay",
        accountNumber: "08123456789",
        accountName: "DevTools Pro",
        type: "mobile_money",
      },
      opay: {
        name: "OPay",
        accountNumber: "08098765432",
        accountName: "DevTools Pro",
        type: "mobile_money",
      },
      moniepoint: {
        name: "Moniepoint",
        accountNumber: "07012345678",
        accountName: "DevTools Pro Enterprises",
        type: "pos_banking",
      },
      binance: {
        name: "Binance Pay",
        accountNumber: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        accountName: "Crypto Wallet",
        type: "crypto",
      },
      ethereum: {
        name: "Ethereum",
        accountNumber: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        accountName: "Crypto Wallet",
        type: "crypto",
      },
    };

    const bank = bankInfo[bankCode] || bankInfo.palmpay;

    const bankNameElement = document.getElementById("bank-name");
    const accountNameElement = document.querySelector(
      ".info-item:nth-child(2) strong"
    );
    const accountNumberElement = document.querySelector(
      ".info-item:nth-child(3) strong"
    );
    const amountElement = document.querySelector(
      ".info-item:nth-child(4) strong"
    );

    if (bankNameElement) bankNameElement.textContent = bank.name;
    if (accountNameElement) accountNameElement.textContent = bank.accountName;
    if (accountNumberElement)
      accountNumberElement.textContent = bank.accountNumber;

    if (amountElement && currentProduct) {
      if (bank.type === "crypto") {
        // For crypto, show USD equivalent
        const cryptoAmount = convertToCrypto(bankCode, currentProduct.price);
        amountElement.textContent = `${cryptoAmount} ${
          bankCode === "binance" ? "BNB" : "ETH"
        } (${formatPrice(currentProduct.price)})`;
        amountElement.className = "amount crypto";
      } else {
        amountElement.textContent = formatPrice(currentProduct.price);
        amountElement.className = "amount";
      }
    }

    // Update QR code
    let qrData = "";
    if (bank.type === "crypto") {
      const cryptoAmount = convertToCrypto(bankCode, currentProduct.price);
      qrData = `Crypto: ${bank.name}%0AAddress: ${
        bank.accountNumber
      }%0AAmount: ${cryptoAmount} ${bankCode === "binance" ? "BNB" : "ETH"}`;
    } else {
      qrData = `Bank: ${bank.name}%0AAccount: ${bank.accountNumber}%0AName: ${
        bank.accountName
      }%0AAmount: ${formatPrice(currentProduct ? currentProduct.price : 0)}`;
    }

    const qrImg = document.querySelector(".qr-code img");
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
    }

    const qrLabel = document.querySelector(".qr-code p");
    if (qrLabel) {
      qrLabel.textContent =
        bank.type === "crypto"
          ? "Scan wallet address"
          : "Scan for account details";
    }
  }

  function convertToCrypto(bankCode, usdAmount) {
    // Approximate conversion rates (update these regularly)
    const rates = {
      binance: 0.0032, // 1 USD ≈ 0.0032 BNB (example rate)
      ethereum: 0.0005, // 1 USD ≈ 0.0005 ETH (example rate)
    };

    const rate = rates[bankCode] || 0.001;
    return (usdAmount * rate).toFixed(6);
  }

  function checkBankingApps(selectedBank) {
    const paymentApps = {
      palmpay: {
        android: "com.transsnet.palmpay",
        ios: "id1478071235",
        universal: "palmpay://",
        website: "https://www.palmpay.com",
      },
      opay: {
        android: "com.opay.checkout",
        ios: "id1450516777",
        universal: "opay://",
        website: "https://www.opayweb.com",
      },
      moniepoint: {
        android: "com.moniepoint.android",
        ios: "id1469551544",
        universal: "moniepoint://",
        website: "https://moniepoint.com",
      },
      binance: {
        android: "com.binance.dev",
        ios: "id1436799971",
        universal: "binance://",
        website: "https://www.binance.com",
      },
      ethereum: {
        android: "org.toshi",
        ios: "id1388444339",
        universal: "ethereum://",
        website: "https://metamask.io",
      },
    };

    const app = paymentApps[selectedBank] || paymentApps.palmpay;
    tryOpenBankApp(app);
  }

  function tryOpenBankApp(bank) {
    let appOpened = false;

    if (bank.universal) {
      const universalLink = document.createElement("a");
      universalLink.href = bank.universal;
      universalLink.style.display = "none";
      document.body.appendChild(universalLink);

      const startTime = Date.now();
      window.addEventListener("blur", function appOpenedListener() {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 100) {
          appOpened = true;
          setTimeout(() => {
            showStep(4);
            showSuccessModal(
              "Banking app opened successfully! Please complete the transfer."
            );
          }, 500);
        }
        window.removeEventListener("blur", appOpenedListener);
      });

      universalLink.click();
      document.body.removeChild(universalLink);

      setTimeout(() => {
        if (!appOpened) {
          const userAgent =
            navigator.userAgent || navigator.vendor || window.opera;

          if (/android/i.test(userAgent)) {
            window.location.href = `https://play.google.com/store/apps/details?id=${bank.android}`;
            showErrorModal("Bank app not found. Redirecting to download page.");
          } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            window.location.href = `https://apps.apple.com/app/id${bank.ios}`;
            showErrorModal("Bank app not found. Redirecting to App Store.");
          } else {
            window.open(bank.website, "_blank");
            showErrorModal(
              "Bank app not available. Please use the bank's website or manual transfer."
            );
          }
        }
      }, 500);
    }
  }

  function showManualTransferInstructions() {
    const bankName = document.getElementById("bank-name").textContent;
    const accountNumber = document.querySelector(
      ".info-item:nth-child(3) strong"
    ).textContent;
    const accountName = document.querySelector(
      ".info-item:nth-child(2) strong"
    ).textContent;
    const amount = document.getElementById("payment-amount").textContent;

    const instructions = `
        <div class="manual-transfer-instructions">
            <h3><i class="fas fa-exchange-alt"></i> Manual Transfer Instructions</h3>
            <div class="instructions-content">
                <p>Please transfer the payment using these details:</p>
                <div class="transfer-details">
                    <div class="detail-item">
                        <span>Bank:</span>
                        <strong>${bankName}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Account Number:</span>
                        <strong>${accountNumber}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Account Name:</span>
                        <strong>${accountName}</strong>
                    </div>
                    <div class="detail-item">
                        <span>Amount:</span>
                        <strong class="amount">${amount}</strong>
                    </div>
                </div>
                <div class="instructions-steps">
                    <p><strong>Steps:</strong></p>
                    <ol>
                        <li>Open your bank's mobile app or website</li>
                        <li>Navigate to "Transfer" or "Send Money"</li>
                        <li>Enter the account details above</li>
                        <li>Enter the exact amount: ${amount}</li>
                        <li>Add reference: ${generateOrderReference()}</li>
                        <li>Complete the transfer</li>
                        <li>Click "Contact on WhatsApp" below to send us proof</li>
                    </ol>
                </div>
                <div class="instructions-note">
                    <p><i class="fas fa-info-circle"></i> <strong>Note:</strong> Your order will be processed after we verify your payment.</p>
                </div>
            </div>
            <div class="instructions-actions">
                <button class="btn-primary" onclick="showStep(4)">
                    <i class="fas fa-check-circle"></i> I've Completed the Transfer
                </button>
                <button class="btn-secondary" onclick="showStep(3)">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
            </div>
        </div>
    `;

    const instructionModal = document.createElement("div");
    instructionModal.className = "modal active";
    instructionModal.innerHTML = `
        <div class="modal-content animate__animated animate__fadeInUp">
            <button class="close-modal" onclick="closeInstructionModal()">&times;</button>
            ${instructions}
        </div>
    `;

    document.body.appendChild(instructionModal);

    window.closeInstructionModal = function () {
      instructionModal.remove();
    };
  }

  // ============ PROFESSIONAL CURRENCY SYSTEM ============

  class CurrencyManager {
    constructor() {
      this.userCurrency = "USD";
      this.currencySymbol = "$";
      this.exchangeRates = { USD: 1, NGN: 1500, EUR: 0.92, GBP: 0.79 };
      this.currencyData = this.createSafeCurrencyData();
      this.isInitialized = false;
      this.supportedCurrencies = ["USD", "NGN", "EUR", "GBP"];
    }

    createSafeCurrencyData() {
      return {
        USD: {
          code: "USD",
          name: "US Dollar",
          symbol: "$",
          decimal_places: 2,
          thousands_separator: ",",
          decimal_separator: ".",
        },
        NGN: {
          code: "NGN",
          name: "Nigerian Naira",
          symbol: "₦",
          decimal_places: 2,
          thousands_separator: ",",
          decimal_separator: ".",
        },
        EUR: {
          code: "EUR",
          name: "Euro",
          symbol: "€",
          decimal_places: 2,
          thousands_separator: ".",
          decimal_separator: ",",
        },
        GBP: {
          code: "GBP",
          name: "British Pound",
          symbol: "£",
          decimal_places: 2,
          thousands_separator: ",",
          decimal_separator: ".",
        },
      };
    }

    // Initialize currency system
    async initialize() {
      if (this.isInitialized) return;

      console.log("🔄 Initializing Currency Manager...");

      try {
        // 1. Load currency data from Supabase
        await this.loadCurrencyData();

        // 2. Detect user's currency
        await this.detectCurrency();

        // 3. Get fresh exchange rates
        await this.fetchExchangeRates();

        // 4. Update all prices on page
        this.updateAllPrices();

        this.isInitialized = true;
        console.log("✅ Currency Manager initialized:", {
          currency: this.userCurrency,
          symbol: this.currencySymbol,
          rates: this.exchangeRates,
        });
      } catch (error) {
        console.error("❌ Currency initialization failed:", error);
        this.useFallbackCurrency();
      }
    }

    // Load currency data from Supabase
    async loadCurrencyData() {
      try {
        const { data, error } = await supabaseClient
          .from("currencies")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;

        if (data && data.length > 0) {
          data.forEach((currency) => {
            this.currencyData[currency.code] = currency;
          });
          console.log(
            "📊 Loaded currency data:",
            Object.keys(this.currencyData)
          );
        } else {
          this.createDefaultCurrencyData();
        }
      } catch (error) {
        console.warn("⚠️ Could not load currency data, using defaults");
        this.createDefaultCurrencyData();
      }
    }

    // Advanced currency detection
    async detectCurrency() {
      // Check if detected currency is supported
      if (this.supportedCurrencies.includes(detectedCurrency)) {
        this.userCurrency = detectedCurrency;
      } else {
        this.userCurrency = "USD"; // Default
      }

      // 1. Check localStorage
      const saved = localStorage.getItem("preferredCurrency");
      if (saved && this.currencyData[saved]) {
        this.userCurrency = saved;
        this.currencySymbol = this.currencyData[saved].symbol;
        return;
      }

      // 2. Simple detection
      const lang = navigator.language || "";
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

      console.log("🌐 Detecting from:", { lang, tz });

      this.currencySymbol = this.currencyData[this.userCurrency]?.symbol || "$";

      if (
        lang.includes("NG") ||
        tz.includes("Lagos") ||
        tz.includes("Africa")
      ) {
        this.userCurrency = "NGN";
        this.currencySymbol = "₦";
      } else if (lang.includes("GB") || tz.includes("London")) {
        this.userCurrency = "GBP";
        this.currencySymbol = "£";
      } else if (
        lang.includes("EU") ||
        lang.includes("de") ||
        lang.includes("fr")
      ) {
        this.userCurrency = "EUR";
        this.currencySymbol = "€";
      } else {
        this.userCurrency = "USD";
        this.currencySymbol = "$";
      }

      // Save detection
      localStorage.setItem("preferredCurrency", this.userCurrency);
      localStorage.setItem("currencySymbol", this.currencySymbol);

      console.log("📍 Currency detected:", {
        detected: detectedCurrency,
        using: this.userCurrency,
        symbol: this.currencySymbol,
      }); 
    }

    async detectFromMultipleSources() {
      // Source 1: Geolocation API
      try {
        const geoCurrency = await this.detectFromGeolocation();
        if (geoCurrency) return geoCurrency;
      } catch (error) {
        console.warn("Geolocation detection failed:", error.message);
      }

      // Source 2: Browser language
      const browserCurrency = this.detectFromBrowser();
      if (browserCurrency) return browserCurrency;

      // Source 3: Timezone
      const timezoneCurrency = this.detectFromTimezone();
      if (timezoneCurrency) return timezoneCurrency;

      // Source 4: Previous preference
      const savedCurrency = localStorage.getItem("preferredCurrency");
      if (savedCurrency && this.supportedCurrencies.includes(savedCurrency)) {
        return savedCurrency;
      }

      return "USD"; // Ultimate fallback
    }

    async detectFromGeolocation() {
      try {
        // Use ipapi.co for reliable geolocation
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.currency) {
          console.log(
            "🌍 Geolocation detected:",
            data.country_name,
            data.currency
          );
          return data.currency;
        }
      } catch (error) {
        // Fallback to ipinfo.io
        try {
          const response = await fetch(
            "https://ipinfo.io/json?token=your_token_here"
          );
          const data = await response.json();
          const country = data.country;

          // Map country to currency
          const countryToCurrency = {
            NG: "NGN", // Nigeria
            US: "USD", // USA
            GB: "GBP", // UK
            DE: "EUR", // Germany
            FR: "EUR", // France
            IT: "EUR", // Italy
            ES: "EUR", // Spain
            CA: "CAD", // Canada
            AU: "AUD", // Australia
            IN: "INR", // India
            CN: "CNY", // China
          };

          return countryToCurrency[country] || null;
        } catch (fallbackError) {
          console.warn("Both geolocation services failed");
          return null;
        }
      }
    }

    detectFromBrowser() {
      const browserLang = navigator.language || navigator.userLanguage;
      console.log("🌐 Browser language:", browserLang);

      if (
        browserLang.includes("NG") ||
        browserLang.includes("ig") ||
        browserLang.includes("yo")
      ) {
        return "NGN";
      } else if (browserLang.includes("GB") || browserLang === "en-GB") {
        return "GBP";
      } else if (browserLang.includes("US") || browserLang === "en-US") {
        return "USD";
      } else if (
        browserLang.includes("DE") ||
        browserLang.includes("FR") ||
        browserLang.includes("IT") ||
        browserLang.includes("ES")
      ) {
        return "EUR";
      }

      return null;
    }

    detectFromTimezone() {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log("⏰ Timezone:", timezone);

      if (timezone.includes("Lagos") || timezone.includes("Africa/Lagos")) {
        return "NGN";
      } else if (
        timezone.includes("London") ||
        timezone.includes("Europe/London")
      ) {
        return "GBP";
      } else if (
        timezone.includes("New_York") ||
        timezone.includes("America/New_York")
      ) {
        return "USD";
      } else if (
        timezone.includes("Berlin") ||
        timezone.includes("Paris") ||
        timezone.includes("Rome") ||
        timezone.includes("Madrid")
      ) {
        return "EUR";
      }

      return null;
    }

    // Fetch real-time exchange rates
    async fetchExchangeRates() {
      const cacheKey = "exchangeRates";
      const cacheTimeKey = "exchangeRatesTime";
      const cacheHours = 6; // Cache for 6 hours

      // Check cache first
      const cachedRates = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);

      if (cachedRates && cacheTime) {
        const age = (Date.now() - parseInt(cacheTime)) / (1000 * 60 * 60); // Hours
        if (age < cacheHours) {
          this.exchangeRates = JSON.parse(cachedRates);
          console.log(
            "📦 Using cached exchange rates (age:",
            age.toFixed(1),
            "hours)"
          );
          return;
        }
      }

      console.log("🔄 Fetching fresh exchange rates...");

      try {
        // Try multiple exchange rate APIs
        const rates = await this.tryExchangeRateAPIs();
        this.exchangeRates = rates;

        // Cache the rates
        localStorage.setItem(cacheKey, JSON.stringify(rates));
        localStorage.setItem(cacheTimeKey, Date.now().toString());

        console.log("✅ Exchange rates updated:", rates);
      } catch (error) {
        console.error("❌ All exchange rate APIs failed:", error);
        this.useFallbackRates();
      }
    }

    async tryExchangeRateAPIs() {
      const apis = [
        "https://api.exchangerate-api.com/v4/latest/USD",
        "https://open.er-api.com/v6/latest/USD",
        "https://api.exchangerate.host/latest?base=USD",
      ];

      for (const apiUrl of apis) {
        try {
          console.log(`Trying API: ${apiUrl}`);
          const response = await fetch(apiUrl);

          if (!response.ok)
            throw new Error(`API ${apiUrl} returned ${response.status}`);

          const data = await response.json();

          if (data.rates && data.rates.USD === 1) {
            console.log(`✅ Success with API: ${apiUrl}`);

            // Extract only needed currencies
            const neededRates = {};
            this.supportedCurrencies.forEach((currency) => {
              neededRates[currency] =
                data.rates[currency] || this.getFallbackRate(currency);
            });

            return neededRates;
          }
        } catch (apiError) {
          console.warn(`API ${apiUrl} failed:`, apiError.message);
          continue;
        }
      }

      throw new Error("All exchange rate APIs failed");
    }

    getFallbackRate(currency) {
      const fallbackRates = {
        USD: 1,
        NGN: 1500,
        EUR: 0.92,
        GBP: 0.79,
      };
      return fallbackRates[currency] || 1;
    }

    useFallbackRates() {
      console.log("⚠️ Using fallback exchange rates");
      this.supportedCurrencies.forEach((currency) => {
        this.exchangeRates[currency] = this.getFallbackRate(currency);
      });
    }

    useFallbackCurrency() {
      this.userCurrency = "USD";
      this.currencySymbol = "$";
      this.exchangeRates = { USD: 1, NGN: 1500, EUR: 0.92, GBP: 0.79 };
      console.log("⚠️ Using fallback currency: USD");
    }

    // ============ FIX THE FORMATPRICE METHOD ============

    // Replace the current formatPrice method with this:
    formatPrice(amount, currencyCode = null) {
      try {
        const currency = currencyCode || this.userCurrency;

        // SAFE ACCESS: Get currency info with fallback
        const currencyInfo = this.currencyData[currency] ||
          this.currencyData["USD"] || {
            code: currency || "USD",
            symbol: this.getSymbol(currency || "USD"),
            decimal_places: 2,
            thousands_separator: ",",
            decimal_separator: ".",
            symbol_position: "before",
          };

        // Convert amount
        const convertedAmount = this.convertPrice(amount, "USD", currency);

        // Format number safely
        let formattedNumber;

        try {
          formattedNumber = convertedAmount.toLocaleString("en-US", {
            minimumFractionDigits: currencyInfo.decimal_places || 2,
            maximumFractionDigits: currencyInfo.decimal_places || 2,
            useGrouping: true,
          });

          // Apply separators safely
          if (
            currencyInfo.thousands_separator &&
            currencyInfo.thousands_separator !== ","
          ) {
            formattedNumber = formattedNumber.replace(
              /,/g,
              currencyInfo.thousands_separator
            );
          }
          if (
            currencyInfo.decimal_separator &&
            currencyInfo.decimal_separator !== "."
          ) {
            formattedNumber = formattedNumber.replace(
              /\./g,
              currencyInfo.decimal_separator
            );
          }
        } catch (formatError) {
          // Fallback formatting
          formattedNumber = convertedAmount.toFixed(
            currencyInfo.decimal_places || 2
          );
        }

        // Add currency symbol
        const symbol = currencyInfo.symbol || this.getSymbol(currency);
        if (currencyInfo.symbol_position === "before") {
          return `${symbol}${formattedNumber}`;
        } else {
          return `${formattedNumber}${symbol}`;
        }
      } catch (error) {
        console.error("❌ Error in formatPrice:", error);
        // Ultimate fallback
        return `$${amount.toFixed(2)}`;
      }
    }

    // Add this helper method if not exists:
    getSymbol(currencyCode) {
      const symbols = {
        USD: "$",
        NGN: "₦",
        EUR: "€",
        GBP: "£",
      };
      return symbols[currencyCode] || "$";
    }

    // Convert and format price
    convertPrice(amount, fromCurrency = "USD", toCurrency = null) {
      const targetCurrency = toCurrency || this.userCurrency;

      if (fromCurrency === targetCurrency) return amount;

      const fromRate = this.exchangeRates[fromCurrency] || 1;
      const toRate = this.exchangeRates[targetCurrency] || 1;

      // Convert: amount in fromCurrency → USD → targetCurrency
      const amountInUSD = amount / fromRate;
      const convertedAmount = amountInUSD * toRate;

      return convertedAmount;
    }

    // Update all prices on the page
    updateAllPrices() {
      console.log("🔄 Updating all prices for", this.userCurrency);

      // Product prices
      document.querySelectorAll("[data-original-price]").forEach((element) => {
        const originalPrice = parseFloat(element.dataset.originalPrice);
        if (!isNaN(originalPrice)) {
          element.textContent = this.formatPrice(originalPrice);
          element.classList.add("price-updated");
        }
      });

      // Product cards
      document.querySelectorAll(".product-card .price").forEach((element) => {
        const priceMatch = element.textContent.match(/\$(\d+\.?\d*)/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          element.dataset.originalPrice = price;
          element.textContent = this.formatPrice(price);
        }
      });

      // Payment modal
      if (window.currentProduct) {
        const productPrice = document.getElementById("payment-product-price");
        const paymentAmount = document.getElementById("payment-amount");

        if (productPrice) {
          productPrice.textContent = this.formatPrice(
            window.currentProduct.price
          );
        }
        if (paymentAmount) {
          paymentAmount.textContent = this.formatPrice(
            window.currentProduct.price
          );
        }
      }

      // Add animation effect
      this.animatePriceUpdates();

      console.log("✅ Prices updated");
    }

    animatePriceUpdates() {
      const prices = document.querySelectorAll(".price-updated");
      prices.forEach((price) => {
        price.style.animation = "pricePulse 0.5s ease";
        setTimeout(() => {
          price.style.animation = "";
          price.classList.remove("price-updated");
        }, 500);
      });
    }

    // Switch currency
    async switchCurrency(newCurrency) {
        if (!this.supportedCurrencies.includes(newCurrency)) {
            console.error("Unsupported currency:", newCurrency);
            return false;
        }
        
        console.log(`🔄 Switching currency from ${this.userCurrency} to ${newCurrency}`);
        
        // Update currency
        this.userCurrency = newCurrency;
        this.currencySymbol = this.currencyData[newCurrency]?.symbol || '$';
        
        // Save preference
        localStorage.setItem('preferredCurrency', newCurrency);
        localStorage.setItem('currencySymbol', this.currencySymbol);
        
        // Update UI
        this.updateAllPrices();
        this.updateCurrencySelector();
        
        // Show notification
        this.showCurrencyNotification(newCurrency);
        
        return true;
    }

    updateCurrencySelector() {
      const selector = document.getElementById("currency-selector");
      if (selector) {
        selector.value = this.userCurrency;
      }
    }

    showCurrencyNotification(currency) {
      const notification = document.createElement("div");
      notification.className = "currency-notification";
      notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>Currency switched to ${
                  this.currencyData[currency]?.name || currency
                } (${this.currencySymbol})</span>
            </div>
        `;

      notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2a9d8f 0%, #21867a 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(42, 157, 143, 0.3);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    // Get currency information
    getCurrencyInfo(currencyCode = null) {
      const code = currencyCode || this.userCurrency;
      return this.currencyData[code] || this.currencyData.USD;
    }

    // Get all supported currencies
    getSupportedCurrencies() {
      return this.supportedCurrencies.map((code) => ({
        code,
        ...this.currencyData[code],
      }));
    }
  }

  // ============ INITIALIZE CURRENCY MANAGER ============

  // Create global instance
  const currencyManager = new CurrencyManager();

  // Initialize when page loads
  document.addEventListener("DOMContentLoaded", async () => {
    await currencyManager.initialize();

    // Update products after currency is set
    if (typeof loadProducts === "function") {
      await loadProducts();
    }
  });

  // ============ MAIN SETUP PAYMENT FLOW FUNCTION ============

  function setupPaymentFlow() {
    console.log("Setting up payment flow...");

    // Proceed to payment button
    const proceedBtn = document.getElementById("proceed-to-payment");
    if (proceedBtn) {
      console.log("Found proceed button");
      proceedBtn.onclick = () => {
        console.log("Proceeding to payment step 2");
        showStep(2);
      };
    }

    // Bank selection
    const bankOptions = document.querySelectorAll(".bank-option");
    console.log("Found bank options:", bankOptions.length);

    bankOptions.forEach((option) => {
      option.onclick = () => {
        console.log("Bank selected:", option.dataset.bank);
        document
          .querySelectorAll(".bank-option")
          .forEach((o) => o.classList.remove("selected"));
        option.classList.add("selected");
        selectedBank = option.dataset.bank;
        console.log("Selected bank stored:", selectedBank);

        updateBankInfo(selectedBank);
      };
    });

    // Confirm bank button
    const confirmBankBtn = document.getElementById("confirm-bank");
    if (confirmBankBtn) {
      console.log("Found confirm bank button");
      confirmBankBtn.onclick = () => {
        if (!selectedBank) {
          showErrorModal("Please select your bank first.");
          return;
        }
        console.log("Confirming bank:", selectedBank);
        showStep(3);
      };
    }

    // Open bank app button
    const openBankAppBtn = document.getElementById("open-bank-app");
    if (openBankAppBtn) {
      console.log("Found open bank app button");
      openBankAppBtn.onclick = () => {
        console.log("Open bank app clicked, selected bank:", selectedBank);

        if (!selectedBank) {
          showErrorModal("Please select a bank first.");
          return;
        }

        const processingOverlay = showProcessing(
          "Checking for banking apps..."
        );

        setTimeout(() => {
          checkBankingApps(selectedBank);

          if (processingOverlay && processingOverlay.parentNode) {
            processingOverlay.remove();
          }
        }, 1000);
      };
    }

    // Manual transfer button
    const manualTransferBtn = document.getElementById("manual-transfer");
    if (manualTransferBtn) {
      console.log("Found manual transfer button");
      manualTransferBtn.onclick = () => {
        if (!selectedBank) {
          showErrorModal("Please select a bank first.");
          return;
        }

        console.log("Showing manual transfer instructions");
        showManualTransferInstructions();
      };
    }

    // Contact WhatsApp button
    const contactWhatsAppBtn = document.getElementById("contact-whatsapp");
    if (contactWhatsAppBtn) {
      console.log("Found contact WhatsApp button");
      contactWhatsAppBtn.onclick = () => {
        if (!currentProduct || !selectedBank) {
          showErrorModal("No product or bank selected.");
          return;
        }

        const message = `Hi DevTools Pro! I just purchased ${
          currentProduct.name
        } for $${currentProduct.price.toFixed(
          2
        )}. My payment details are:\n\nBank: ${getBankFullName(
          selectedBank
        )}\nAmount: $${currentProduct.price.toFixed(
          2
        )}\nOrder Reference: ${generateOrderReference()}`;
        console.log("Opening WhatsApp with message");
        window.open(
          `https://api.whatsapp.com/send?phone=12245376239&text=${encodeURIComponent(
            message
          )}`,
          "_blank"
        );
      };
    }

    // Close payment button
    const closePaymentBtn = document.getElementById("close-payment");
    if (closePaymentBtn) {
      console.log("Found close payment button");
      closePaymentBtn.onclick = () => {
        console.log("Closing payment modal");
        closeAllModals();
        currentProduct = null;
        selectedBank = null;
      };
    }

    console.log("Payment flow setup complete");
  }

  // ============ ADDITIONAL FUNCTIONS NEEDED ============

  function addPaymentStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .processing-overlay {
            display: none;
        }
        
        .processing-overlay.active {
            display: flex;
        }
        
        .processing-content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .processing-content .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        .manual-transfer-instructions {
            max-width: 500px;
            margin: 0 auto;
        }
        
        .instructions-content {
            margin: 1.5rem 0;
        }
        
        .transfer-details {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            margin: 1rem 0;
            border: 1px solid #e9ecef;
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.8rem;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid #dee2e6;
        }
        
        .detail-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .detail-item span {
            color: #6c757d;
            font-weight: 500;
        }
        
        .instructions-steps {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #f1faee;
            border-radius: 8px;
            border-left: 4px solid var(--primary);
        }
        
        .instructions-steps ol {
            margin: 0.5rem 0 0 1rem;
            padding-left: 1rem;
        }
        
        .instructions-steps li {
            margin-bottom: 0.5rem;
            color: #495057;
        }
        
        .instructions-note {
            margin-top: 1rem;
            padding: 1rem;
            background: #fff3cd;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
        }
        
        .instructions-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .instructions-actions button {
            flex: 1;
            justify-content: center;
        }
        
        .error-message, .success-message {
            text-align: center;
            padding: 2rem;
        }
        
        .error-message i {
            font-size: 3rem;
            color: #dc3545;
            margin-bottom: 1rem;
        }
        
        .success-message i {
            font-size: 3rem;
            color: #28a745;
            margin-bottom: 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    document.head.appendChild(style);
  }

  function showStep(stepNumber) {
    currentStep = stepNumber;
    document.querySelectorAll(".payment-step").forEach((step) => {
      step.classList.remove("active");
    });
    const stepElement = document.getElementById(`step${stepNumber}`);
    if (stepElement) {
      stepElement.classList.add("active");
    }
    console.log("Showing step:", stepNumber);
  }

  // ============ INITIALIZE APP ============

  function initApp() {
    console.log("Initializing app...");
    addPaymentStyles();
    setupEventListeners();
    loadProducts();
    setupTestimonialSlider();
    console.log("App initialized successfully");
  }

  // Dynamic layout adjustments
  function optimizeLayout() {
    const screenWidth = window.innerWidth;
    const productsGrid = document.getElementById("products-grid");

    if (!productsGrid) return;

    // Adjust product grid based on screen size
    if (screenWidth >= 1400) {
      // Large desktop - 4 columns
      productsGrid.style.gridTemplateColumns = "repeat(4, 1fr)";
    } else if (screenWidth >= 992) {
      // Desktop - 3 columns
      productsGrid.style.gridTemplateColumns = "repeat(3, 1fr)";
    } else if (screenWidth >= 768) {
      // Tablet - 2 columns
      productsGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
    } else {
      // Mobile - 1 column
      productsGrid.style.gridTemplateColumns = "1fr";
    }

    // Adjust font sizes dynamically
    const heroTitle = document.querySelector(".hero-content h1");
    if (heroTitle && screenWidth >= 992) {
      heroTitle.style.fontSize = Math.min(3.5, 2 + screenWidth / 300) + "rem";
    }
  }

  // Call on load and resize
  window.addEventListener("load", optimizeLayout);
  window.addEventListener("resize", optimizeLayout);

  function getWhatsAppUrl(phoneNumber, message) {
    // Format: +12245376239 becomes 12245376239 (no plus sign in URL)
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(message);
    return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
  }

  // Update all WhatsApp button clicks
  whatsappButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const message = "Hi DevTools Pro Support, I need assistance";
      const whatsappUrl = getWhatsAppUrl("+12245376239", message);
      window.open(whatsappUrl, "_blank");
    });
  });

  // Update payment completion WhatsApp button
  contactWhatsAppBtn = document.getElementById("contact-whatsapp");
  if (contactWhatsAppBtn) {
    contactWhatsAppBtn.onclick = () => {
      const message = `Hi DevTools Pro! I just purchased ${
        currentProduct.name
      } for $${currentProduct.price.toFixed(
        2
      )}. My payment details are:\n\nBank: ${getBankFullName(
        selectedBank
      )}\nAmount: $${currentProduct.price.toFixed(
        2
      )}\nOrder Reference: ${generateOrderReference()}`;
      const whatsappUrl = getWhatsAppUrl("+12245376239", message);
      window.open(whatsappUrl, "_blank");
    };
  }

  function showStep(stepNumber) {
    currentStep = stepNumber;
    document.querySelectorAll(".payment-step").forEach((step) => {
      step.classList.remove("active");
    });
    const stepElement = document.getElementById(`step${stepNumber}`);
    if (stepElement) {
      stepElement.classList.add("active");
    }
  }

  function setupTestimonialSlider() {
    const testimonials = document.querySelectorAll(".testimonial");
    if (testimonials.length === 0) return;

    let currentIndex = 0;

    function showTestimonial(index) {
      testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle("active", i === index);
      });
    }

    // Auto-rotate testimonials
    setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }, 5000);

    // Show first testimonial
    showTestimonial(0);
  }

  function showLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.add("active");
    }
  }

  function hideLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.remove("active");
    }
  }

  function showError(message) {
    alert(`Error: ${message}`);
  }

  // Add some animations on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll(".step").forEach((step) => {
    step.style.opacity = "0";
    step.style.transform = "translateY(20px)";
    step.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(step);
  });

  // Test connection on load
  console.log("User dashboard JavaScript loaded successfully!");
});
