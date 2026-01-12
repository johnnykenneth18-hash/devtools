// admin.js - Admin Panel JavaScript with Supabase Integration
document.addEventListener("DOMContentLoaded", function () {
  // Supabase Configuration - Replace with your actual Supabase credentials
  const SUPABASE_URL = "https://hqgphtfuefmhhbspfyly.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZ3BodGZ1ZWZtaGhic3BmeWx5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzM3Mjg1MywiZXhwIjoyMDgyOTQ4ODUzfQ.Ol4pIDqHUOBhBbes0_7Xd3KAWvwcbPWZS1BGhlVQOaU";

  // Initialize Supabase client
  let supabaseClient = null;

  // Check if Supabase is available globally or initialize it
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.warn("Supabase client not available globally. Loading from CDN...");
    // You'll need to include this in your HTML:
    // <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  // DOM Elements
  const adminSections = document.querySelectorAll(".admin-section");
  const navItems = document.querySelectorAll(".admin-nav-item");
  const sectionTitle = document.getElementById("section-title");
  const addProductBtn = document.getElementById("add-product-btn");
  const refreshDataBtn = document.getElementById("refresh-data");
  const logoutBtn = document.getElementById("logout-btn");
  const productModal = document.getElementById("product-modal");
  const closeModalButtons = document.querySelectorAll(
    ".close-modal, .close-product-modal"
  );
  const confirmModal = document.getElementById("confirm-modal");
  const loadingOverlay = document.getElementById("admin-loading");

  // State variables
  let currentSection = "dashboard";
  let currentProductId = null;
  let confirmCallback = null;

  // Initialize admin panel
  initAdminPanel();

  function initAdminPanel() {
    setupEventListeners();
    loadDashboardData();
    addDynamicStyles();
  }

  function setupEventListeners() {
    // Navigation
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        switchSection(section);
      });
    });

    // Add product button
    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => {
        openProductModal();
      });
    }

    // Refresh data button
    if (refreshDataBtn) {
      refreshDataBtn.addEventListener("click", () => {
        refreshCurrentSection();
      });
    }

    // Logout button
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        logout();
      });
    }

    // Close modal buttons
    closeModalButtons.forEach((button) => {
      button.addEventListener("click", () => {
        closeAllModals();
      });
    });

    // Close modal when clicking outside
    [productModal, confirmModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            closeAllModals();
          }
        });
      }
    });

    // Product form submission
    const productForm = document.getElementById("product-form");
    if (productForm) {
      productForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await saveProduct();
      });
    }

    // Confirm modal buttons
    const confirmCancelBtn = document.getElementById("confirm-cancel");
    const confirmOkBtn = document.getElementById("confirm-ok");

    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener("click", () => {
        confirmModal.classList.remove("active");
      });
    }

    if (confirmOkBtn) {
      confirmOkBtn.addEventListener("click", () => {
        if (confirmCallback) {
          confirmCallback();
        }
        confirmModal.classList.remove("active");
      });
    }

    // Search and filter functionality
    setupSearchAndFilter();

    // Settings forms
    setupSettingsForms();

    // Export buttons
    setupExportButtons();
  }

  function switchSection(section) {
    // Update navigation
    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.section === section) {
        item.classList.add("active");
      }
    });

    // Update sections
    adminSections.forEach((sec) => {
      sec.classList.remove("active");
      if (sec.id === `${section}-section`) {
        sec.classList.add("active");
      }
    });

    // Update title
    sectionTitle.textContent =
      section.charAt(0).toUpperCase() + section.slice(1);

    // Load section data
    currentSection = section;
    loadSectionData(section);
  }

  async function loadSectionData(section) {
    showLoading();

    try {
      switch (section) {
        case "dashboard":
          await loadDashboardData();
          break;
        case "products":
          await loadProducts();
          break;
        case "orders":
          await loadOrders();
          break;
        case "customers":
          await loadCustomers();
          break;
        case "settings":
          await loadSettings();
          break;
      }
    } catch (error) {
      console.error(`Error loading ${section}:`, error);
      showError(`Failed to load ${section} data`);
    } finally {
      hideLoading();
    }
  }

  async function loadDashboardData() {
    try {
      // Load stats from Supabase
      const stats = await getStats();

      // Update stats cards
      if (stats) {
        document.getElementById("total-products").textContent =
          stats.totalProducts || 0;
        document.getElementById("total-orders").textContent =
          stats.totalOrders || 0;
        document.getElementById("total-revenue").textContent = `$${
          stats.totalRevenue?.toFixed(2) || "0.00"
        }`;
        document.getElementById("total-customers").textContent =
          stats.totalCustomers || 0;
      }

      // Load recent orders
      await loadRecentOrders();

      // Load popular products
      await loadPopularProducts();
    } catch (error) {
      console.error("Error loading dashboard:", error);
      // Fallback to mock data if Supabase fails
      loadMockDashboardData();
    }
  }

  async function getStats() {
    try {
      // Get products count
      const { count: productCount, error: productError } = await supabaseClient
        .from("products")
        .select("*", { count: "exact", head: true });

      // Get orders count and total revenue
      const { data: orders, error: orderError } = await supabaseClient
        .from("orders")
        .select("amount");

      // Get customers count
      const { count: customerCount, error: customerError } =
        await supabaseClient
          .from("customers")
          .select("*", { count: "exact", head: true });

      let totalRevenue = 0;
      if (orders) {
        totalRevenue = orders.reduce(
          (sum, order) => sum + (order.amount || 0),
          0
        );
      }

      return {
        totalProducts: productCount || 0,
        totalOrders: orders?.length || 0,
        totalRevenue: totalRevenue,
        totalCustomers: customerCount || 0,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
      };
    }
  }

  function loadMockDashboardData() {
    // Mock data for demo
    document.getElementById("total-products").textContent = "0";
    document.getElementById("total-orders").textContent = "0";
    document.getElementById("total-revenue").textContent = "$0.00";
    document.getElementById("total-customers").textContent = "0";

    // Load mock recent orders
    loadMockRecentOrders();
    // Load mock popular products
    loadMockPopularProducts();
  }

  async function loadRecentOrders() {
    const ordersBody = document.getElementById("recent-orders");
    if (!ordersBody) return;

    try {
      const { data: orders, error } = await supabaseClient
        .from("orders")
        .select(
          `
          *,
          products(name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error loading recent orders:", error);
        loadMockRecentOrders();
        return;
      }

      if (!orders || orders.length === 0) {
        ordersBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: #6c757d;">
              No orders yet
            </td>
          </tr>
        `;
        return;
      }

      ordersBody.innerHTML = orders
        .map((order) => {
          const productName =
            order.products?.name || order.product_name || "Unknown Product";
          const orderId =
            order.order_number || `ORD-${order.id.substring(0, 8)}`;

          return `
            <tr>
                <td>${orderId}</td>
                <td>${productName}</td>
                <td>${order.customer_name || "Unknown Customer"}</td>
                <td>$${order.amount?.toFixed(2) || "0.00"}</td>
                <td><span class="status-badge status-${
                  order.payment_status || "pending"
                }">${order.payment_status || "pending"}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          `;
        })
        .join("");
    } catch (error) {
      console.error("Error loading recent orders:", error);
      loadMockRecentOrders();
    }
  }

  function loadMockRecentOrders() {
    const ordersBody = document.getElementById("recent-orders");
    if (!ordersBody) return;

    ordersBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #6c757d;">
          No orders yet. Start selling your products!
        </td>
      </tr>
    `;
  }

  async function loadPopularProducts() {
    const popularProducts = document.getElementById("popular-products");
    if (!popularProducts) return;

    try {
      // Get products with most orders (you might want to create a view for this)
      const { data: products, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error loading popular products:", error);
        loadMockPopularProducts();
        return;
      }

      if (!products || products.length === 0) {
        popularProducts.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #6c757d;">
            No products yet. Add your first product!
          </div>
        `;
        return;
      }

      popularProducts.innerHTML = products
        .map(
          (product, index) => `
            <div class="popular-product">
                <div class="product-rank">${index + 1}</div>
                <img src="${
                  product.image_url ||
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                }" alt="${product.name}">
                <div style="flex: 1;">
                    <h4>${product.name}</h4>
                    <p>$${product.price?.toFixed(2) || "0.00"}</p>
                </div>
            </div>
        `
        )
        .join("");
    } catch (error) {
      console.error("Error loading popular products:", error);
      loadMockPopularProducts();
    }
  }

  function loadMockPopularProducts() {
    const popularProducts = document.getElementById("popular-products");
    if (!popularProducts) return;

    popularProducts.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #6c757d;">
        No products yet. Add your first product to get started!
      </div>
    `;
  }

  async function loadProducts() {
    const tableBody = document.getElementById("products-table-body");
    if (!tableBody) return;

    try {
      const { data: products, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading products:", error);
        showError("Failed to load products");
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">
              Error loading products. Please try again.
            </td>
          </tr>
        `;
        return;
      }

      if (!products || products.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">
              No products yet. Click "Add Product" to create your first product!
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = products
        .map(
          (product) => `
            <tr>
                <td>${product.id.substring(0, 8)}...</td>
                <td><img src="${
                  product.image_url ||
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                }" alt="${
            product.name
          }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
                <td>${product.name}</td>
                <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${
                  product.description || "No description"
                }</td>
                <td>$${product.price?.toFixed(2) || "0.00"}</td>
                <td>
                    <span class="status-badge ${
                      product.active ? "status-completed" : "status-failed"
                    }">
                        ${product.active ? "Active" : "Inactive"}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${
                      product.featured ? "status-completed" : "status-pending"
                    }">
                        ${product.featured ? "Yes" : "No"}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-product-id="${
                          product.id
                        }">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-product-id="${
                          product.id
                        }" data-product-name="${product.name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
        )
        .join("");

      // Add event listeners to dynamically created buttons
      document.querySelectorAll(".edit-btn[data-product-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const productId = btn.dataset.productId;
          const product = products.find((p) => p.id === productId);
          if (product) {
            editProduct(product);
          }
        });
      });

      document
        .querySelectorAll(".delete-btn[data-product-id]")
        .forEach((btn) => {
          btn.addEventListener("click", () => {
            const productId = btn.dataset.productId;
            const productName = btn.dataset.productName;
            deleteProduct(productId, productName);
          });
        });
    } catch (error) {
      console.error("Error loading products:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">
            Error loading products. Please check your connection.
          </td>
        </tr>
      `;
    }
  }

  function openProductModal(product = null) {
    const modal = document.getElementById("product-modal");
    const title = document.getElementById("product-modal-title");
    const form = document.getElementById("product-form");

    if (!modal || !title || !form) return;

    if (product) {
      // Edit mode
      title.textContent = "Edit Product";
      currentProductId = product.id;

      // Fill form with product data
      document.getElementById("product-name").value = product.name || "";
      document.getElementById("product-price").value = product.price || "";
      document.getElementById("product-description").value =
        product.description || "";
      document.getElementById("product-category").value =
        product.category || "web-tools";
      document.getElementById("product-image").value = product.image_url || "";
      document.getElementById("product-featured").checked =
        product.featured || false;
      document.getElementById("product-active").checked =
        product.active !== false;
    } else {
      // Add mode
      title.textContent = "Add New Product";
      currentProductId = null;
      form.reset();
      // Set default image if empty
      document.getElementById("product-image").value =
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
    }

    closeAllModals();
    modal.classList.add("active");
  }

  async function saveProduct() {
    showLoading();

    try {
      const productData = {
        name: document.getElementById("product-name").value.trim(),
        price: parseFloat(document.getElementById("product-price").value),
        description: document
          .getElementById("product-description")
          .value.trim(),
        category: document.getElementById("product-category").value,
        image_url:
          document.getElementById("product-image").value.trim() ||
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        featured: document.getElementById("product-featured").checked,
        active: document.getElementById("product-active").checked,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (currentProductId) {
        // Update existing product
        result = await supabaseClient
          .from("products")
          .update(productData)
          .eq("id", currentProductId);

        if (result.error) throw result.error;
        showSuccess("Product updated successfully!");
      } else {
        // Insert new product
        result = await supabaseClient.from("products").insert([productData]);

        if (result.error) throw result.error;
        showSuccess("Product added successfully!");
      }

      closeAllModals();
      loadSectionData("products");
      loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error("Error saving product:", error);
      showError("Failed to save product: " + error.message);
    } finally {
      hideLoading();
    }
  }

  function deleteProduct(id, name) {
    confirmCallback = async () => {
      showLoading();

      try {
        const { error } = await supabaseClient
          .from("products")
          .delete()
          .eq("id", id);

        if (error) throw error;

        showSuccess(`Product "${name}" deleted successfully!`);
        loadSectionData("products");
        loadDashboardData(); // Refresh dashboard stats
      } catch (error) {
        console.error("Error deleting product:", error);
        showError("Failed to delete product: " + error.message);
      } finally {
        hideLoading();
      }
    };

    document.getElementById("confirm-title").textContent = "Delete Product";
    document.getElementById(
      "confirm-message"
    ).textContent = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
    confirmModal.classList.add("active");
  }

  async function loadOrders() {
    const tableBody = document.getElementById("orders-table-body");
    if (!tableBody) return;

    try {
      const { data: orders, error } = await supabaseClient
        .from("orders")
        .select(
          `
          *,
          products(name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        showError("Failed to load orders");
        tableBody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 2rem; color: #6c757d;">
              Error loading orders. Please try again.
            </td>
          </tr>
        `;
        return;
      }

      if (!orders || orders.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 2rem; color: #6c757d;">
              No orders yet. Orders will appear here when customers purchase your products.
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = orders
        .map((order) => {
          const productName = order.products?.name || "Unknown Product";
          const orderId =
            order.order_number || `ORD-${order.id.substring(0, 8)}`;

          return `
            <tr>
                <td>${orderId}</td>
                <td>${productName}</td>
                <td>${order.customer_name || "Unknown Customer"}</td>
                <td>${order.bank_name || "N/A"}</td>
                <td>$${order.amount?.toFixed(2) || "0.00"}</td>
                <td><span class="status-badge status-${
                  order.payment_status || "pending"
                }">${order.payment_status || "pending"}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge status-${
                  order.delivery_status === "delivered"
                    ? "completed"
                    : "pending"
                }">${order.delivery_status || "pending"}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-order-id="${
                          order.id
                        }" title="Mark as Delivered">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn view-btn" data-order-id="${
                          order.id
                        }" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
          `;
        })
        .join("");

      // Add event listeners to order buttons
      document.querySelectorAll(".edit-btn[data-order-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const orderId = btn.dataset.orderId;
          markAsDelivered(orderId);
        });
      });

      document.querySelectorAll(".view-btn[data-order-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const orderId = btn.dataset.orderId;
          viewOrder(orderId);
        });
      });
    } catch (error) {
      console.error("Error loading orders:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2rem; color: #6c757d;">
            Error loading orders. Please check your connection.
          </td>
        </tr>
      `;
    }
  }

  async function loadCustomers() {
    const tableBody = document.getElementById("customers-table-body");
    if (!tableBody) return;

    try {
      const { data: customers, error } = await supabaseClient
        .from("customers")
        .select("*")
        .order("last_order_date", { ascending: false });

      if (error) {
        console.error("Error loading customers:", error);
        showError("Failed to load customers");
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">
              Error loading customers. Please try again.
            </td>
          </tr>
        `;
        return;
      }

      if (!customers || customers.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">
              No customers yet. Customers will appear here after they make purchases.
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = customers
        .map(
          (customer) => `
            <tr>
                <td>${customer.id.substring(0, 8)}...</td>
                <td>${customer.name || "Unknown"}</td>
                <td>${customer.email || "N/A"}</td>
                <td>${customer.phone || "N/A"}</td>
                <td>${customer.total_orders || 0}</td>
                <td>$${customer.total_spent?.toFixed(2) || "0.00"}</td>
                <td>${
                  customer.last_order_date
                    ? new Date(customer.last_order_date).toLocaleDateString()
                    : "Never"
                }</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" data-customer-id="${
                          customer.id
                        }" title="View Customer">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" data-customer-email="${
                          customer.email
                        }" title="Contact Customer">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
        )
        .join("");

      // Add event listeners to customer buttons
      document
        .querySelectorAll(".view-btn[data-customer-id]")
        .forEach((btn) => {
          btn.addEventListener("click", () => {
            const customerId = btn.dataset.customerId;
            viewCustomer(customerId);
          });
        });

      document
        .querySelectorAll(".edit-btn[data-customer-email]")
        .forEach((btn) => {
          btn.addEventListener("click", () => {
            const customerEmail = btn.dataset.customerEmail;
            contactCustomer(customerEmail);
          });
        });
    } catch (error) {
      console.error("Error loading customers:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: #6c757d;">
            Error loading customers. Please check your connection.
          </td>
        </tr>
      `;
    }
  }

  async function loadSettings() {
    try {
      // Load settings from Supabase
      const { data: settings, error } = await supabaseClient
        .from("settings")
        .select("*");

      if (error) {
        console.error("Error loading settings:", error);
        // Use default settings
        loadDefaultSettings();
        return;
      }

      if (settings) {
        // Convert settings array to object
        const settingsObj = {};
        settings.forEach((setting) => {
          settingsObj[setting.setting_key] = setting.setting_value;
        });

        // Fill form fields
        if (document.getElementById("store-name")) {
          document.getElementById("store-name").value =
            settingsObj.store_name || "DevTools Pro";
        }
        if (document.getElementById("store-email")) {
          document.getElementById("store-email").value =
            settingsObj.store_email || "support@devtoolspro.com";
        }
        if (document.getElementById("whatsapp-number")) {
          document.getElementById("whatsapp-number").value =
            settingsObj.whatsapp_number || "+1 (224) 537-6239";
        }
        if (document.getElementById("currency")) {
          document.getElementById("currency").value =
            settingsObj.currency || "USD";
        }
        if (document.getElementById("email-notifications")) {
          document.getElementById("email-notifications").checked =
            settingsObj.email_notifications === "true";
        }
        if (document.getElementById("whatsapp-notifications")) {
          document.getElementById("whatsapp-notifications").checked =
            settingsObj.whatsapp_notifications === "true";
        }
        if (document.getElementById("new-order-alerts")) {
          document.getElementById("new-order-alerts").checked =
            settingsObj.new_order_alerts === "true";
        }

        // Load bank details
        const { data: bankDetails, error: bankError } = await supabaseClient
          .from("bank_details")
          .select("*")
          .eq("active", true)
          .single();

        if (!bankError && bankDetails) {
          if (document.getElementById("bank-name")) {
            document.getElementById("bank-name").value =
              bankDetails.bank_name || "";
          }
          if (document.getElementById("account-name")) {
            document.getElementById("account-name").value =
              bankDetails.account_name || "";
          }
          if (document.getElementById("account-number")) {
            document.getElementById("account-number").value =
              bankDetails.account_number || "";
          }
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      loadDefaultSettings();
    }
  }

  function loadDefaultSettings() {
    // Fill with default values
    if (document.getElementById("store-name")) {
      document.getElementById("store-name").value = "DevTools Pro";
    }
    if (document.getElementById("store-email")) {
      document.getElementById("store-email").value = "support@devtoolspro.com";
    }
    if (document.getElementById("whatsapp-number")) {
      document.getElementById("whatsapp-number").value = "+12245376239";
    }
    if (document.getElementById("currency")) {
      document.getElementById("currency").value = "USD";
    }
    if (document.getElementById("bank-name")) {
      document.getElementById("bank-name").value = "Guaranty Trust Bank";
    }
    if (document.getElementById("account-name")) {
      document.getElementById("account-name").value =
        "DevTools Pro Enterprises";
    }
    if (document.getElementById("account-number")) {
      document.getElementById("account-number").value = "0123456789";
    }
  }

  function setupSearchAndFilter() {
    // Product search
    const productSearch = document.getElementById("product-search");
    if (productSearch) {
      productSearch.addEventListener(
        "input",
        debounce(() => {
          filterProducts();
        }, 300)
      );
    }

    // Product filter
    const productFilter = document.getElementById("product-filter");
    if (productFilter) {
      productFilter.addEventListener("change", () => {
        filterProducts();
      });
    }

    // Order search
    const orderSearch = document.getElementById("order-search");
    if (orderSearch) {
      orderSearch.addEventListener(
        "input",
        debounce(() => {
          filterOrders();
        }, 300)
      );
    }

    // Order filter
    const orderFilter = document.getElementById("order-filter");
    if (orderFilter) {
      orderFilter.addEventListener("change", () => {
        filterOrders();
      });
    }

    // Customer search
    const customerSearch = document.getElementById("customer-search");
    if (customerSearch) {
      customerSearch.addEventListener(
        "input",
        debounce(() => {
          filterCustomers();
        }, 300)
      );
    }
  }

  function filterProducts() {
    const searchTerm =
      document.getElementById("product-search")?.value.toLowerCase() || "";
    const filterValue =
      document.getElementById("product-filter")?.value || "all";
    const rows = document.querySelectorAll("#products-table-body tr");

    rows.forEach((row) => {
      if (row.cells.length < 8) return; // Skip empty rows

      const name = row.cells[2]?.textContent.toLowerCase() || "";
      const description = row.cells[3]?.textContent.toLowerCase() || "";
      const activeElement = row.cells[5]?.querySelector(".status-badge");
      const active = activeElement?.textContent.toLowerCase() || "";
      const featuredElement = row.cells[6]?.querySelector(".status-badge");
      const featured = featuredElement?.textContent.toLowerCase() || "";

      let matchesSearch =
        name.includes(searchTerm) || description.includes(searchTerm);
      let matchesFilter = true;

      switch (filterValue) {
        case "active":
          matchesFilter = active === "active";
          break;
        case "inactive":
          matchesFilter = active === "inactive";
          break;
        case "featured":
          matchesFilter = featured === "yes";
          break;
      }

      row.style.display = matchesSearch && matchesFilter ? "" : "none";
    });
  }

  function filterOrders() {
    const searchTerm =
      document.getElementById("order-search")?.value.toLowerCase() || "";
    const filterValue = document.getElementById("order-filter")?.value || "all";
    const rows = document.querySelectorAll("#orders-table-body tr");

    rows.forEach((row) => {
      if (row.cells.length < 9) return; // Skip empty rows

      const id = row.cells[0]?.textContent.toLowerCase() || "";
      const product = row.cells[1]?.textContent.toLowerCase() || "";
      const customer = row.cells[2]?.textContent.toLowerCase() || "";
      const statusElement = row.cells[5]?.querySelector(".status-badge");
      const status = statusElement?.textContent.toLowerCase() || "";

      let matchesSearch =
        id.includes(searchTerm) ||
        product.includes(searchTerm) ||
        customer.includes(searchTerm);
      let matchesFilter = true;

      switch (filterValue) {
        case "pending":
          matchesFilter = status === "pending";
          break;
        case "completed":
          matchesFilter = status === "completed";
          break;
        case "failed":
          matchesFilter = status === "failed";
          break;
      }

      row.style.display = matchesSearch && matchesFilter ? "" : "none";
    });
  }

  function filterCustomers() {
    const searchTerm =
      document.getElementById("customer-search")?.value.toLowerCase() || "";
    const rows = document.querySelectorAll("#customers-table-body tr");

    rows.forEach((row) => {
      if (row.cells.length < 8) return; // Skip empty rows

      const name = row.cells[1]?.textContent.toLowerCase() || "";
      const email = row.cells[2]?.textContent.toLowerCase() || "";
      const phone = row.cells[3]?.textContent.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        phone.includes(searchTerm);

      row.style.display = matchesSearch ? "" : "none";
    });
  }

  function setupSettingsForms() {
    // General settings form
    const generalForm = document.getElementById("general-settings-form");
    if (generalForm) {
      generalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveGeneralSettings();
      });
    }

    // Bank settings form
    const bankForm = document.getElementById("bank-settings-form");
    if (bankForm) {
      bankForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveBankSettings();
      });
    }

    // Notifications save button
    const saveNotificationsBtn = document.getElementById("save-notifications");
    if (saveNotificationsBtn) {
      saveNotificationsBtn.addEventListener("click", saveNotificationSettings);
    }
  }

  function setupExportButtons() {
    // Export products button
    const exportProductsBtn = document.getElementById("export-products");
    if (exportProductsBtn) {
      exportProductsBtn.addEventListener("click", () => exportData("products"));
    }

    // Export orders button
    const exportOrdersBtn = document.getElementById("export-orders");
    if (exportOrdersBtn) {
      exportOrdersBtn.addEventListener("click", () => exportData("orders"));
    }

    // Export customers button
    const exportCustomersBtn = document.getElementById("export-customers");
    if (exportCustomersBtn) {
      exportCustomersBtn.addEventListener("click", () =>
        exportData("customers")
      );
    }
  }

  async function saveGeneralSettings() {
    showLoading();

    try {
      const settings = [
        {
          setting_key: "store_name",
          setting_value: document.getElementById("store-name").value,
          setting_type: "string",
        },
        {
          setting_key: "store_email",
          setting_value: document.getElementById("store-email").value,
          setting_type: "string",
        },
        {
          setting_key: "whatsapp_number",
          setting_value: document.getElementById("whatsapp-number").value,
          setting_type: "string",
        },
        {
          setting_key: "currency",
          setting_value: document.getElementById("currency").value,
          setting_type: "string",
        },
      ];

      // Upsert settings
      for (const setting of settings) {
        const { error } = await supabaseClient
          .from("settings")
          .upsert(setting, { onConflict: "setting_key" });

        if (error) throw error;
      }

      showSuccess("General settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      showError("Failed to save settings: " + error.message);
    } finally {
      hideLoading();
    }
  }

  async function saveBankSettings() {
    showLoading();

    try {
      const bankDetails = {
        bank_name: document.getElementById("bank-name").value,
        account_name: document.getElementById("account-name").value,
        account_number: document.getElementById("account-number").value,
        active: true,
      };

      // First, deactivate all existing bank details
      const { error: deactivateError } = await supabaseClient
        .from("bank_details")
        .update({ active: false })
        .eq("active", true);

      if (deactivateError) throw deactivateError;

      // Insert new bank details
      const { error: insertError } = await supabaseClient
        .from("bank_details")
        .insert([bankDetails]);

      if (insertError) throw insertError;

      showSuccess("Bank details updated successfully!");
    } catch (error) {
      console.error("Error saving bank details:", error);
      showError("Failed to update bank details: " + error.message);
    } finally {
      hideLoading();
    }
  }

  async function saveNotificationSettings() {
    showLoading();

    try {
      const emailNotifications = document.getElementById("email-notifications");
      const whatsappNotifications = document.getElementById(
        "whatsapp-notifications"
      );
      const newOrderAlerts = document.getElementById("new-order-alerts");

      const settings = [
        {
          setting_key: "email_notifications",
          setting_value: emailNotifications.checked ? "true" : "false",
          setting_type: "boolean",
        },
        {
          setting_key: "whatsapp_notifications",
          setting_value: whatsappNotifications.checked ? "true" : "false",
          setting_type: "boolean",
        },
        {
          setting_key: "new_order_alerts",
          setting_value: newOrderAlerts.checked ? "true" : "false",
          setting_type: "boolean",
        },
      ];

      // Upsert settings
      for (const setting of settings) {
        const { error } = await supabaseClient
          .from("settings")
          .upsert(setting, { onConflict: "setting_key" });

        if (error) throw error;
      }

      showSuccess("Notification preferences saved!");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      showError("Failed to save notification preferences");
    } finally {
      hideLoading();
    }
  }

  async function exportData(type) {
    showLoading();

    try {
      let data = [];
      let filename = "";

      switch (type) {
        case "products":
          const { data: products } = await supabaseClient
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

          if (!products) {
            showError("No products to export");
            return;
          }

          data = [
            [
              "ID",
              "Name",
              "Description",
              "Price",
              "Category",
              "Active",
              "Featured",
              "Created At",
            ],
          ];

          products.forEach((product) => {
            data.push([
              product.id,
              product.name,
              product.description,
              `$${product.price?.toFixed(2) || "0.00"}`,
              product.category,
              product.active ? "Yes" : "No",
              product.featured ? "Yes" : "No",
              new Date(product.created_at).toLocaleString(),
            ]);
          });

          filename = `products_export_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;

        case "orders":
          const { data: orders } = await supabaseClient
            .from("orders")
            .select(
              `
              *,
              products(name)
            `
            )
            .order("created_at", { ascending: false });

          if (!orders) {
            showError("No orders to export");
            return;
          }

          data = [
            [
              "Order ID",
              "Product",
              "Customer",
              "Email",
              "Phone",
              "Bank",
              "Amount",
              "Status",
              "Delivery Status",
              "Date",
            ],
          ];

          orders.forEach((order) => {
            data.push([
              order.order_number || `ORD-${order.id.substring(0, 8)}`,
              order.products?.name || "Unknown Product",
              order.customer_name,
              order.customer_email || "N/A",
              order.customer_phone || "N/A",
              order.bank_name || "N/A",
              `$${order.amount?.toFixed(2) || "0.00"}`,
              order.payment_status,
              order.delivery_status,
              new Date(order.created_at).toLocaleString(),
            ]);
          });

          filename = `orders_export_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;

        case "customers":
          const { data: customers } = await supabaseClient
            .from("customers")
            .select("*")
            .order("last_order_date", { ascending: false });

          if (!customers) {
            showError("No customers to export");
            return;
          }

          data = [
            [
              "ID",
              "Name",
              "Email",
              "Phone",
              "Total Orders",
              "Total Spent",
              "Last Order",
              "Created At",
            ],
          ];

          customers.forEach((customer) => {
            data.push([
              customer.id,
              customer.name,
              customer.email || "N/A",
              customer.phone || "N/A",
              customer.total_orders || 0,
              `$${customer.total_spent?.toFixed(2) || "0.00"}`,
              customer.last_order_date
                ? new Date(customer.last_order_date).toLocaleDateString()
                : "Never",
              new Date(customer.created_at).toLocaleString(),
            ]);
          });

          filename = `customers_export_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
      }

      // Convert to CSV
      const csv = data
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      // Create download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showSuccess(
        `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`
      );
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      showError(`Failed to export ${type}`);
    } finally {
      hideLoading();
    }
  }

  function refreshCurrentSection() {
    loadSectionData(currentSection);
    showSuccess("Data refreshed successfully!");
  }

  function logout() {
    // Clear any session data
    localStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_auth");

    // Redirect to main page
    window.location.href = "index.html";
  }

  function closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active");
    });
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

  function showSuccess(message) {
    // Create toast notification
    const toast = document.createElement("div");
    toast.className = "toast success";
    toast.textContent = message;
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 4000;
            animation: slideIn 0.3s ease-out;
            font-family: 'Poppins', sans-serif;
        `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function showError(message) {
    const toast = document.createElement("div");
    toast.className = "toast error";
    toast.textContent = message;
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 4000;
            animation: slideIn 0.3s ease-out;
            font-family: 'Poppins', sans-serif;
        `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Utility functions
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Function to add dynamic CSS styles
  function addDynamicStyles() {
    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-completed {
            background: rgba(67, 160, 71, 0.1);
            color: #43a047;
            border: 1px solid rgba(67, 160, 71, 0.2);
        }
        
        .status-pending {
            background: rgba(255, 179, 0, 0.1);
            color: #ffb300;
            border: 1px solid rgba(255, 179, 0, 0.2);
        }
        
        .status-failed {
            background: rgba(211, 47, 47, 0.1);
            color: #d32f2f;
            border: 1px solid rgba(211, 47, 47, 0.2);
        }
        
        .action-buttons {
            display: flex;
            gap: 8px;
        }
        
        .action-btn {
            width: 36px;
            height: 36px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }
        
        .edit-btn {
            background: #e3f2fd;
            color: #4361ee;
        }
        
        .edit-btn:hover {
            background: #4361ee;
            color: white;
        }
        
        .delete-btn {
            background: #ffebee;
            color: #f94144;
        }
        
        .delete-btn:hover {
            background: #f94144;
            color: white;
        }
        
        .view-btn {
            background: #e8f5e9;
            color: #4cc9f0;
        }
        
        .view-btn:hover {
            background: #4cc9f0;
            color: white;
        }
        
        .popular-product {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .product-rank {
            width: 30px;
            height: 30px;
            background: #4361ee;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .popular-product img {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 8px;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        
        .data-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        .data-table tbody tr:hover {
            background: #f8f9fa;
        }
    `;
    document.head.appendChild(style);
  }

  // Expose functions to global scope for inline handlers (keeping for backward compatibility)
  window.editProduct = function (product) {
    openProductModal(product);
  };

  window.deleteProduct = deleteProduct;

  window.markAsDelivered = async function (orderId) {
    showLoading();
    try {
      const { error } = await supabaseClient
        .from("orders")
        .update({
          delivery_status: "delivered",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      showSuccess(`Order marked as delivered!`);
      loadOrders();
      loadDashboardData();
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      showError("Failed to update order status");
    } finally {
      hideLoading();
    }
  };

  window.viewOrder = function (orderId) {
    showSuccess(`Viewing order ${orderId} details...`);
    // In production, you would show a detailed view modal
    // For now, just show a message
  };

  window.viewCustomer = function (customerId) {
    showSuccess(`Viewing customer ${customerId} details...`);
    // In production, you would show a detailed view modal
    // For now, just show a message
  };

  window.contactCustomer = function (email) {
    if (email && email !== "N/A") {
      window.open(`mailto:${email}?subject=DevTools%20Pro%20Support`, "_blank");
    } else {
      showError("No email address available for this customer");
    }
  };
});
