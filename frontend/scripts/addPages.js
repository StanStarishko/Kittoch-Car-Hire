// Function to check vehicle availability
function checkVehicleAvailability(recordId, startDate = null, endDate = null) {
  const collection = "Booking";
  const apiUrl = "https://kittoch-car-hire.onrender.com/api/universalCRUD";
  let dateRanges = "";

  if (startDate != null && endDate != null) {
    dateRanges = {
      dateRanges: { startDate, endDate },
    };
  } else if (startDate != null && endDate == null) {
    dateRanges = {
      dateRanges: startDate,
    };
  } else if (startDate == null && endDate != null) {
    dateRanges = {
      dateRanges: endDate,
    };
  }

  try {
    const requestBody = {
      filters: {
        CarId: recordId,
        dateRanges,
      },
    };

    const response = fetch(`${apiUrl}/filtered/${collection}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = response.json();

      if (data.results && data.results.length > 0) {
        return false;
      } else {
        return true;
      }
    } else {
      const errorText = response.text();
      console.error("Server error:", response.status, errorText);
      alert("Error loading record data");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Error connecting to server");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  let schema = null;
  const apiUrl = "https://kittoch-car-hire.onrender.com/api/universalCRUD";

  // Get the collection name and record ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const collection = urlParams.get("collection") || "Employee";
  const recordId = urlParams.get("id");
  let dataRecordID = null;
  const returnUrl =
    urlParams.get("returnUrl") ||
    (collection === "Employee" && !recordId
      ? "/"
      : "/frontend/html/dashboard.html");

  // Update form title
  const formTitle = document.getElementById("formTitle");
  formTitle.textContent = recordId ? `Edit ${collection}` : `New ${collection}`;

  // Handle back button
  const backButton = document.getElementById("backButton");
  backButton.addEventListener("click", function () {
    window.location.href = decodeURIComponent(returnUrl);
  });
  backButton.textContent =
    returnUrl === "/" ? "Back to Login" : "Back to Dashboard";

  // Function to return to dashboard or login page
  function returnToPage() {
    window.location.href = decodeURIComponent(returnUrl);
  }

  // Function to load settings from local file
  async function loadSettingsFile(filename) {
    try {
      const response = await fetch(`${apiUrl}/settings/${filename}`);
      if (!response.ok) throw new Error("Settings file not found");
      return await response.json();
    } catch (error) {
      console.error("Error loading settings:", error);
      return null;
    }
  }

  // Enhanced function to get nested value from settings using path
  function getValueFromPath(obj, path, parentValue = null) {
    if (!obj || !path) return [];

    const parts = path.split(".");
    let current = obj;

    // Handle hierarchical structure with parent value
    if (parentValue) {
      const parentParts = parts.slice(0, -1);
      let parentObj = current;

      // Navigate to parent level
      for (const part of parentParts) {
        if (!parentObj[part]) return [];
        parentObj = parentObj[part];
      }

      // Check if parent value exists and has children
      if (parentObj[parentValue]) {
        return parentObj[parentValue][parts[parts.length - 1]] || [];
      }
      return [];
    }

    // For non-hierarchical paths
    for (const part of parts) {
      if (!current || typeof current !== "object") return [];
      current = current[part];
    }

    return Array.isArray(current) ? current : [];
  }

  // Function to get field metadata from schema
  async function getFieldMetadata(schema, fieldName) {
    const field = schema[fieldName];
    if (!field?.metadata) return null;
    return {
      label: field.metadata.label || fieldName,
      required: field.metadata.required || false,
    };
  }

  // Function to create enhanced select with autocomplete
  function createEnhancedSelect(
    fieldName,
    metadata,
    options = [],
    parentField = null,
    schema = null
  ) {
    const wrapper = document.createElement("div");
    wrapper.className = "position-relative";

    const input = document.createElement("input");
    input.type = "text";
    input.id = fieldName;
    input.name = fieldName;
    input.className = "form-control";
    input.placeholder = metadata.placeholder;
    input.required = metadata.required;

    const dropdown = document.createElement("ul");
    dropdown.className = "dropdown-menu w-100 position-absolute";
    dropdown.style.cssText =
      "display: none; z-index: 1000; background: white; border: 1px solid #ddd; max-height: 200px; overflow-y: auto;";

    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);

    let currentOptions = [...options];

    // Initialize dropdown with filtered options based on parent value
    async function updateOptionsBasedOnParent() {
      if (parentField) {
        const parentValue = document.getElementById(parentField)?.value;
        if (parentValue) {
          const [filename, pathInFile] = metadata.setting.split("#");
          const settings = await loadSettingsFile(filename);
          if (settings) {
            const newOptions = getValueFromPath(
              settings,
              pathInFile,
              parentValue
            );
            if (Array.isArray(newOptions)) {
              currentOptions = [...newOptions];
              updateDropdown(
                currentOptions.filter((opt) =>
                  opt.toLowerCase().includes(input.value.toLowerCase())
                )
              );
            }
          }
        } else {
          currentOptions = [];
          updateDropdown([]);
        }
      }
    }

    // Input handler with validation
    input.addEventListener("input", async function () {
      if (parentField) {
        const parentInput = document.getElementById(parentField);
        if (!parentInput?.value) {
          const parentMetadata = await getFieldMetadata(schema, parentField);
          this.value = "";
          alert(`Please select ${parentMetadata.label} first`);
          return;
        }
      }

      const value = this.value.toLowerCase();
      const matches = currentOptions.filter((option) =>
        option.toLowerCase().includes(value)
      );
      updateDropdown(matches);
    });

    // Update dropdown list
    function updateDropdown(matches) {
      dropdown.innerHTML = "";
      if (matches.length > 0) {
        matches.forEach((match) => {
          const li = document.createElement("li");
          li.style.cssText = "padding: 8px 12px; cursor: pointer;";
          li.textContent = match;
          li.addEventListener("click", () => {
            input.value = match;
            dropdown.style.display = "none";
            // Trigger change event for dependent fields
            const event = new Event("change", { bubbles: true });
            input.dispatchEvent(event);
          });
          li.addEventListener("mouseenter", () => {
            li.style.backgroundColor = "#f8f9fa";
          });
          li.addEventListener("mouseleave", () => {
            li.style.backgroundColor = "transparent";
          });
          dropdown.appendChild(li);
        });
        dropdown.style.display = "block";
      } else {
        dropdown.style.display = "none";
      }
    }

    // Close dropdown on outside click
    document.addEventListener("click", function (e) {
      if (!wrapper.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    // Store new value on form submit
    input.form?.addEventListener("submit", function () {
      const newValue = input.value;
      if (newValue && !allOptions.includes(newValue)) {
        allOptions.push(newValue);
        localStorage.setItem(storageKey, JSON.stringify(allOptions));
      }
    });

    // If this field has a parent, update options when parent changes
    if (parentField) {
      const parentInput = document.getElementById(parentField);
      if (parentInput) {
        parentInput.addEventListener("change", async () => {
          input.value = ""; // Clear dependent field
          await updateOptionsBasedOnParent();
        });
      }
    }

    return wrapper;
  }

  // Function to fetch options from referenced collections
  async function fetchOptionsFromCollection(selectElement, collectionName) {
    try {
      const response = await fetch(`${apiUrl}/${collectionName}`);
      const items = await response.json();

      items.forEach((item) => {
        const optionElement = document.createElement("option");
        optionElement.value = item._id;
        optionElement.textContent =
          item[`${collectionName}Id`] || item.name || item.title || item._id;
        selectElement.appendChild(optionElement);
      });
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  }

  // Fetch schema and populate form
  fetch(`${apiUrl}/schema/${collection}`)
    .then((response) => response.json())
    .then(async (schemaData) => {
      schema = schemaData.obj;
      const formFields = document.getElementById("formFields");

      // Keep track of field dependencies
      const dependentFields = new Map();

      // First pass: identify dependent fields
      for (const [fieldName, field] of Object.entries(schema)) {
        if (field.metadata?.setting) {
          const pathParts = field.metadata.setting.split("#")[1].split(".");
          if (pathParts.length > 2) {
            // For hierarchical fields, the parent is typically the field that comes before
            const parentFieldName = Object.keys(schema).find((key) =>
              schema[key].metadata?.setting?.includes(
                pathParts.slice(0, -1).join(".")
              )
            );
            if (parentFieldName) {
              dependentFields.set(fieldName, parentFieldName);
            }
          }
        }
      }

      // Create form fields based on schema
      for (const [fieldName, field] of Object.entries(schema)) {
        if (
          fieldName !== "_id" &&
          fieldName !== "__v" &&
          fieldName !== "createdAt" &&
          fieldName !== "updatedAt"
        ) {
          const metadata = field.metadata;
          if (!metadata) {
            console.warn(`Metadata not found for field: ${fieldName}`);
            continue;
          }

          const div = document.createElement("div");
          div.className = "form-group";

          const label = document.createElement("label");
          label.htmlFor = fieldName;
          label.textContent = metadata.label;
          div.appendChild(label);

          if (metadata.type === "select" && metadata.setting) {
            // Handle settings-based select field
            const [filename, pathInFile] = metadata.setting.split("#");
            const settings = await loadSettingsFile(filename);
            const parentField = dependentFields.get(fieldName);
            const options = settings
              ? getValueFromPath(settings, pathInFile)
              : [];

            const enhancedSelect = createEnhancedSelect(
              fieldName,
              metadata,
              options,
              parentField,
              schema
            );
            div.appendChild(enhancedSelect);
          } else if (metadata.type === "select") {
            // Handle regular select field
            const select = document.createElement("select");
            select.id = fieldName;
            select.name = fieldName;
            select.className = "form-control";
            select.required = metadata.required;

            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = `Select ${metadata.label}`;
            select.appendChild(defaultOption);

            if (field.ref) {
              await fetchOptionsFromCollection(select, field.ref);
            }

            div.appendChild(select);
          } else {
            // Handle other input types
            const input = document.createElement("input");
            input.type = metadata.type;
            input.id = fieldName;
            input.name = fieldName;
            input.className =
              metadata.type === "checkbox"
                ? "form-check-input"
                : "form-control";
            input.placeholder = metadata.placeholder;
            input.required = metadata.required;
            div.appendChild(input);
          }

          formFields.appendChild(div);
        }
      }

      // If editing, fetch and populate existing data
      if (recordId) {
        try {
          const requestBody = {
            filters: {
              [`${collection}Id`]: recordId,
            },
          };

          const response = await fetch(`${apiUrl}/filtered/${collection}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const record = data.results[0];
              dataRecordID = record._id;

              // Populate form fields with the record data
              for (const [key, value] of Object.entries(record)) {
                const element = document.getElementById(key);
                if (element) {
                  if (element.type === "checkbox") {
                    element.checked = value;
                  } else if (element.type === "date" && value) {
                    element.value = new Date(value).toISOString().split("T")[0];
                  } else if (element.tagName === "SELECT") {
                    element.value = value || "";
                  } else if (
                    element.type === "text" &&
                    element.closest(".position-relative")
                  ) {
                    const storageKey = `customValues_${key}`;
                    const storedOptions = JSON.parse(
                      localStorage.getItem(storageKey) || "[]"
                    );
                    if (!storedOptions.includes(value) && value) {
                      storedOptions.push(value);
                      localStorage.setItem(
                        storageKey,
                        JSON.stringify(storedOptions)
                      );
                    }
                    element.value = value || "";

                    // Trigger change event for parent fields
                    if (value) {
                      const event = new Event("change", { bubbles: true });
                      element.dispatchEvent(event);
                    }
                  } else {
                    element.value = value || "";
                  }
                }
              }
            } else {
              console.error("No records found for ID:", recordId);
              alert("Record not found");
            }
          } else {
            const errorText = await response.text();
            console.error("Server error:", response.status, errorText);
            alert("Error loading record data");
          }
        } catch (error) {
          console.error("Fetch error:", error);
          alert("Error connecting to server");
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error loading form data. Please try again.");
    });

  // Function to deep merge arrays and objects
  function deepMerge(target, source) {
    if (Array.isArray(source)) {
      if (!Array.isArray(target)) {
        target = [];
      }
      // Add only unique values
      source.forEach((item) => {
        if (!target.includes(item)) {
          target.push(item);
        }
      });
      return target;
    }

    if (source && typeof source === "object") {
      if (!target || typeof target !== "object") {
        target = {};
      }
      Object.keys(source).forEach((key) => {
        target[key] = deepMerge(target[key], source[key]);
      });
      return target;
    }

    return source;
  }

  // Function to create nested structure from path and value
  function createNestedStructure(path, value) {
    const pathParts = path.split(".");
    const result = {};
    let current = result;

    for (let i = 0; i < pathParts.length - 1; i++) {
      current[pathParts[i]] = {};
      current = current[pathParts[i]];
    }

    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = Array.isArray(value) ? value : [value];

    return result;
  }

  // Function for saving settings to local file
  async function saveSettingsFile(filename, updates) {
    console.log("Batch saving settings:", {
      filename,
      updates: Array.from(updates),
    });

    try {
      // Load current settings once
      const currentSettings = await loadSettingsFile(filename);
      if (!currentSettings) throw new Error("Unable to load current settings");

      // Create a single merged structure from all updates
      const newStructure = Array.from(updates).reduce((acc, [path, value]) => {
        const structure = createNestedStructure(path, value);
        return deepMerge(acc, structure);
      }, {});

      // Merge with current settings
      const updatedSettings = deepMerge(currentSettings, newStructure);

      console.log(
        "Current settings structure:",
        JSON.stringify(currentSettings, null, 2)
      );

      console.log(
        "New settings structure:",
        JSON.stringify(newStructure, null, 2)
      );

      console.log(
        "Final settings structure:",
        JSON.stringify(updatedSettings, null, 2)
      );

      // Save updated settings
      const response = await fetch(`${apiUrl}/settings/${filename}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save settings: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving settings:", error);
      return null;
    }
  }

  // Function to update settings file with new values
  async function updateSettingsWithNewValues(formData) {
    if (!schema) return;

    // Get fields based on settings
    const fieldsWithSettings = Object.entries(schema).filter(
      ([_, field]) =>
        field.metadata?.type === "select" && field.metadata?.setting
    );

    // Group all updates by filename
    const settingsUpdates = new Map();

    for (const [fieldName, field] of fieldsWithSettings) {
      const fieldValue = formData[fieldName];
      if (!fieldValue) continue;

      const [filename, path] = field.metadata.setting.split("#");
      const pathParts = path.split(".");

      // Find parent field if exists
      const parentField = Object.entries(schema).find(([_, otherField]) => {
        if (!otherField.metadata?.setting) return false;
        const [otherFile, otherPath] = otherField.metadata.setting.split("#");
        return (
          otherFile === filename &&
          pathParts[0] === otherPath.split(".")[0] &&
          pathParts.length > otherPath.split(".").length
        );
      });

      if (!settingsUpdates.has(filename)) {
        settingsUpdates.set(filename, new Map());
      }
      const fileUpdates = settingsUpdates.get(filename);

      // Handle nested paths with parent values
      if (parentField) {
        const [parentFieldName] = parentField;
        const parentValue = formData[parentFieldName];
        if (!parentValue) continue;

        // Create full path including parent value
        const fullPath = pathParts
          .map((part, index) => {
            if (index === pathParts.length - 2) return parentValue;
            return part;
          })
          .join(".");

        fileUpdates.set(fullPath, fieldValue);
      } else {
        fileUpdates.set(path, fieldValue);
      }
    }

    // Process updates for each file once
    for (const [filename, updates] of settingsUpdates) {
      try {
        await saveSettingsFile(filename, updates);
      } catch (error) {
        console.error(`Error updating settings for ${filename}:`, error);
      }
    }
  }

  // Handle form submission
  document
    .getElementById("universalForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = {};
      const inputs = this.querySelectorAll("input, select");
      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          formData[input.name] = input.checked;
        } else {
          formData[input.name] = input.value;
        }
      });

      try {
        // Update settings file if needed
        await updateSettingsWithNewValues(formData);

        const method = recordId ? "PUT" : "POST";
        const url = recordId
          ? `${apiUrl}/${collection}/${dataRecordID}`
          : `${apiUrl}/${collection}`;

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert("Record saved successfully");
          returnToPage();
        } else {
          const error = await response.json();
          alert(error.message || "Error saving data");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Server error. Please try again later.");
      }
    });
});
