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

  function initApp() {
    console.log("Initializing app...");
    setupEventListeners();
    loadProducts();
    setupTestimonialSlider();
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
    // Replace the existing admin login code with this:
    const adminLoginForm = document.getElementById("admin-login-form");
    if (adminLoginForm) {
      adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("admin-email").value;
        const password = document.getElementById("admin-password").value;

        // Simple hardcoded validation
        if (email === "arinzeadmin@websell.com" && password === "Arinze2002@") {
          showLoading();
          setTimeout(() => {
            hideLoading();
            window.location.href = "admin.html";
          }, 1000);
        } else {
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

  // Add this function to properly format WhatsApp URLs
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

  async function loadProducts() {
    console.log("Loading products from Supabase...");
    showLoading();

    try {
      // Fetch products from Supabase
      const { data: products, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading products from Supabase:", error);
        // Fallback to mock data
        const mockProducts = getMockProducts();
        displayProducts(mockProducts);
        return;
      }

      console.log("Products loaded from Supabase:", products);

      if (!products || products.length === 0) {
        console.log("No products found in database");
        displayProducts([]);
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

      displayProducts(formattedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      // Fallback to mock data
      const mockProducts = getMockProducts();
      displayProducts(mockProducts);
      showError("Failed to load products. Please try again later.");
    } finally {
      hideLoading();
    }
  }

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

  function getDefaultImage() {
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
  }

  function displayProducts(products) {
    if (!productsGrid) {
      console.error("Products grid element not found!");
      return;
    }

    productsGrid.innerHTML = "";

    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products" style="text-align: center; padding: 3rem; color: #6c757d; grid-column: 1 / -1;">
          <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h3>No products available</h3>
          <p>Check back soon for new tools!</p>
        </div>
      `;
      return;
    }

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = `product-card ${
        product.featured ? "featured" : ""
      }`;
      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${
        product.name
      }" onerror="this.src='${getDefaultImage()}'">
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-price">
            <div class="price">$${product.price.toFixed(2)}</div>
            <button class="btn-buy" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Buy Now
            </button>
          </div>
        </div>
      `;

      productsGrid.appendChild(productCard);

      // Add click event to buy button
      const buyButton = productCard.querySelector(".btn-buy");
      buyButton.addEventListener("click", () => {
        startPurchase(product);
      });
    });

    console.log(`Displayed ${products.length} products`);
  }

  function startPurchase(product) {
    console.log("Starting purchase for product:", product);
    currentProduct = product;
    currentStep = 1;
    selectedBank = null;

    // Update payment modal with product info
    const productImage = document.getElementById("payment-product-image");
    const productName = document.getElementById("payment-product-name");
    const productPrice = document.getElementById("payment-product-price");
    const paymentAmount = document.getElementById("payment-amount");

    if (productImage) productImage.src = product.image;
    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = `$${product.price.toFixed(2)}`;
    if (paymentAmount)
      paymentAmount.textContent = `$${product.price.toFixed(2)}`;

    // Reset steps
    document.querySelectorAll(".payment-step").forEach((step) => {
      step.classList.remove("active");
    });
    const step1 = document.getElementById("step1");
    if (step1) step1.classList.add("active");

    // Reset bank selection
    document.querySelectorAll(".bank-option").forEach((option) => {
      option.classList.remove("selected");
    });

    // Show payment modal
    closeAllModals();
    if (paymentModal) {
      paymentModal.classList.add("active");
    }

    // Setup payment flow event listeners
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

    // Update bank details in the modal
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
        // Convert USD to crypto (approximate rates)
        const cryptoAmount = convertToCrypto(bankCode, currentProduct.price);
        amountElement.textContent = `${cryptoAmount} ${
          bankCode === "binance" ? "BNB" : "ETH"
        }`;
        amountElement.className = "amount crypto";
      } else {
        amountElement.textContent = `$${currentProduct.price.toFixed(2)}`;
        amountElement.className = "amount";
      }
    }

    // Also update QR code with bank details
    let qrData = "";
    if (bank.type === "crypto") {
      const cryptoAmount = convertToCrypto(bankCode, currentProduct.price);
      qrData = `Crypto: ${bank.name}%0AAddress: ${
        bank.accountNumber
      }%0AAmount: ${cryptoAmount} ${bankCode === "binance" ? "BNB" : "ETH"}`;
    } else {
      qrData = `Bank: ${bank.name}%0AAccount: ${bank.accountNumber}%0AName: ${
        bank.accountName
      }%0AAmount: $${
        currentProduct ? currentProduct.price.toFixed(2) : "0.00"
      }`;
    }

    const qrImg = document.querySelector(".qr-code img");
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
    }

    // Update QR code label
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
              "Bank app not available. Please use the bank's website."
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

  function simulateBankRedirect() {
    console.log("Simulating bank app redirect...");
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
  console.log("Supabase URL:", SUPABASE_URL);
});
