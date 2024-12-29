
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
      const response = await fetch(filename);
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

    // If we have a parent value and it's a hierarchical structure
    if (parentValue && parts.includes("model")) {
      // Navigate to the parent's model array
      current = current[parts[0]][parts[1]][parentValue]?.model;
      return current || [];
    }

    // For non-hierarchical paths
    for (const part of parts) {
      if (!current || typeof current !== "object") return [];
      current = current[part];
    }

    // If the result is an object with named properties, return the keys
    if (current && typeof current === "object" && !Array.isArray(current)) {
      return Object.keys(current);
    }

    return current || [];
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

    // Add validation for dependent fields
    if (parentField) {
      input.addEventListener("focus", async function () {
        const parentInput = document.getElementById(parentField);
        if (!parentInput?.value) {
          const parentMetadata = await getFieldMetadata(schema, parentField);
          input.blur();
          alert(`Please select ${parentMetadata.label} first`);
        }
      });
    }

    const dropdown = document.createElement("ul");
    dropdown.className = "dropdown-menu w-100 position-absolute";
    dropdown.style.cssText =
      "display: none; z-index: 1000; background: white; border: 1px solid #ddd; max-height: 200px; overflow-y: auto;";

    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);

    const storageKey = `customValues_${fieldName}`;
    const storedOptions = JSON.parse(localStorage.getItem(storageKey) || "[]");
    let allOptions = [...new Set([...options, ...storedOptions])];

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
              allOptions = [...new Set([...newOptions, ...storedOptions])];
              updateDropdown(
                allOptions.filter((opt) =>
                  opt.toLowerCase().includes(input.value.toLowerCase())
                )
              );
            }
          }
        } else {
          allOptions = [...storedOptions];
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
      const matches = allOptions.filter((option) =>
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

  // Function to update settings file with new values
  async function updateSettingsWithNewValues(formData) {
    if (!schema) {
      console.error('Schema is not loaded');
      return;
    }    
    
    // Read current schema to find fields with settings
    const fieldsWithSettings = Object.entries(schema).filter(
      ([_, field]) =>
        field.metadata?.type === "select" && field.metadata?.setting
    );

    // Group fields by settings file to minimize file operations
    const fileOperations = new Map();

    for (const [fieldName, field] of fieldsWithSettings) {
      const fieldValue = formData[fieldName];
      if (!fieldValue) continue;

      const [filename, path] = field.metadata.setting.split("#");

      // Initialize file operation if not exists
      if (!fileOperations.has(filename)) {
        try {
          const settingsData = await fs.promises.readFile(filename, "utf8");
          fileOperations.set(filename, JSON.parse(settingsData));
        } catch (error) {
          console.error(`Error reading settings file ${filename}:`, error);
          throw error;
        }
      }

      const settings = fileOperations.get(filename);
      const pathParts = path.split(".");

      // Find if this field is part of a hierarchy by analyzing other fields' settings
      const isHierarchicalField = Object.entries(schema).some(
        ([otherField, otherValue]) => {
          if (otherField === fieldName) return false;
          const otherSetting = otherValue.metadata?.setting;
          if (!otherSetting) return false;

          const [otherFile, otherPath] = otherSetting.split("#");
          return otherFile === filename && otherPath.startsWith(path);
        }
      );

      // Find parent field if exists
      const parentField = Object.entries(schema).find(
        ([otherField, otherValue]) => {
          const otherSetting = otherValue.metadata?.setting;
          if (!otherSetting) return false;

          const [otherFile, otherPath] = otherSetting.split("#");
          return (
            otherFile === filename &&
            path.startsWith(otherPath) &&
            path !== otherPath
          );
        }
      );

      let current = settings;

      if (isHierarchicalField && parentField) {
        const [parentFieldName, parentFieldData] = parentField;
        const parentValue = formData[parentFieldName];
        if (!parentValue) continue;

        // Navigate to parent level
        const parentPathParts = parentFieldData.metadata.setting
          .split("#")[1]
          .split(".");
        for (const part of parentPathParts) {
          current = current[part];
          if (!current) {
            current = {};
            break;
          }
        }

        // Initialize parent value if doesn't exist
        if (!current[parentValue]) {
          current[parentValue] = {};
        }

        // For fields that contain arrays of values
        const lastPart = pathParts[pathParts.length - 1];
        if (!current[parentValue][lastPart]) {
          current[parentValue][lastPart] = [];
        }

        // Add new value if it doesn't exist
        if (!current[parentValue][lastPart].includes(fieldValue)) {
          current[parentValue][lastPart].push(fieldValue);
        }
      } else {
        // Handle non-hierarchical fields
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]];
        }

        const lastPart = pathParts[pathParts.length - 1];
        if (!Array.isArray(current[lastPart])) {
          current[lastPart] = [];
        }

        if (!current[lastPart].includes(fieldValue)) {
          current[lastPart].push(fieldValue);
        }
      }
    }

    // Write all modified files
    for (const [filename, data] of fileOperations) {
      try {
        await fs.promises.writeFile(
          filename,
          JSON.stringify(data, null, 4),
          "utf8"
        );
      } catch (error) {
        console.error(`Error writing settings file ${filename}:`, error);
        throw error;
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
