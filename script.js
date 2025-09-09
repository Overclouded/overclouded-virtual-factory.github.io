// jQuery to handle the jsTree
$(function () {
  $("#mqttTree").jstree({
    core: {
      check_callback: true,
      data: [],
    },
    plugins: ["state"],
    types: {
      default: {
        a_attr: { class: "wrap-text" }, // Apply wrap-text to the <a> tag
      },
    },
  });

  // Load initial data
  loadDataFromJson();
});

// Function to load data from data.json
async function loadDataFromJson() {
  try {
    // Add cache-busting parameter to ensure fresh data on each request
    const timestamp = new Date().getTime();
    const response = await fetch(`data.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Loaded data from data.json:", data);

    updateTree(data);

    // Remove any existing error messages on successful load
    $(".error-message").remove();
  } catch (error) {
    console.error("Error loading data from data.json:", error);
    showError(`Failed to load data: ${error.message}`);
  }
}

// Function to update the tree with new data
function updateTree(data) {
  let container = $("#mqttTree").jstree(true);

  if (!container) {
    // Initialize tree if not already initialized
    $("#mqttTree").jstree();
    container = $("#mqttTree").jstree(true);
  }

  // Clear existing tree data for fresh update
  container.delete_node(container.get_children_dom("#"));

  // Function to add or update nodes recursively
  function addOrUpdateNodes(node, parentId) {
    Object.keys(node).forEach((key) => {
      let nodeId = parentId === "#" ? key : `${parentId}/${key}`;

      if (
        typeof node[key] === "object" &&
        node[key] !== null &&
        node[key].hasOwnProperty("value") &&
        node[key].hasOwnProperty("timestamp")
      ) {
        const value = node[key].value;
        const timestamp = new Date(node[key].timestamp).toLocaleString();

        const displayText = `${key}: ${value} (${timestamp})`;

        container.create_node(
          parentId,
          {
            id: nodeId,
            text: displayText,
            icon: "jstree-icon jstree-file",
          },
          "last"
        );
      } else if (typeof node[key] === "object" && node[key] !== null) {
        container.create_node(parentId, { id: nodeId, text: key }, "last");
        addOrUpdateNodes(node[key], nodeId);
      }
    });
  }

  addOrUpdateNodes(data, "#");
}

// Function to show error messages
function showError(message) {
  // Remove any existing error messages
  $(".error-message").remove();

  // Add new error message
  const errorDiv = $('<div class="error-message"></div>').text(message);
  $("#mqttTree").before(errorDiv);

  // Remove error message after 5 seconds
  setTimeout(() => {
    errorDiv.fadeOut(() => errorDiv.remove());
  }, 5000);
}
