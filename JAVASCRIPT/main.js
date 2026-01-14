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
          "https://wa.me/12345678901?text=Hi%20DevTools%20Pro%20Support%2C%20I%20need%20assistance",
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

  function setupPaymentFlow() {
    // Proceed to payment button
    const proceedBtn = document.getElementById("proceed-to-payment");
    if (proceedBtn) {
      proceedBtn.onclick = () => {
        showStep(2);
      };
    }

    // Bank selection
    document.querySelectorAll(".bank-option").forEach((option) => {
      option.onclick = () => {
        document
          .querySelectorAll(".bank-option")
          .forEach((o) => o.classList.remove("selected"));
        option.classList.add("selected");
        selectedBank = option.dataset.bank;
      };
    });

    // Confirm bank button
    const confirmBankBtn = document.getElementById("confirm-bank");
    if (confirmBankBtn) {
      confirmBankBtn.onclick = () => {
        if (!selectedBank) {
          alert("Please select your bank first.");
          return;
        }
        showStep(3);
      };
    }

    // Open bank app button
    const openBankAppBtn = document.getElementById("open-bank-app");
    if (openBankAppBtn) {
      openBankAppBtn.onclick = () => {
        alert(
          `Opening ${selectedBank ? selectedBank.toUpperCase() : "bank"} app...`
        );

        // Simulate successful payment after delay
        setTimeout(() => {
          showStep(4);
          simulateBankRedirect();
        }, 2000);
      };
    }

    // Manual transfer button
    const manualTransferBtn = document.getElementById("manual-transfer");
    if (manualTransferBtn) {
      manualTransferBtn.onclick = () => {
        alert("Please complete the transfer manually and return to this page.");
        showStep(4);
      };
    }

    // Contact WhatsApp button
    const contactWhatsAppBtn = document.getElementById("contact-whatsapp");
    if (contactWhatsAppBtn) {
      contactWhatsAppBtn.onclick = () => {
        const message = `Hi! I just purchased ${currentProduct.name}. Here's my payment receipt.`;
        window.open(
          `https://wa.me/12345678901?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      };
    }

    // Close payment button
    const closePaymentBtn = document.getElementById("close-payment");
    if (closePaymentBtn) {
      closePaymentBtn.onclick = () => {
        closeAllModals();
        currentProduct = null;
      };
    }
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
