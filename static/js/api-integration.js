document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("registrationLookupForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const reg = document.getElementById("registrationInput").value;

        try {
            const response = await fetch("/api/vehicle-lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registrationNumber: reg }),
            });
            const data = await response.json();

            if (!response.ok) {
                // Handle API error response
                const errorMessages = data.errors.map(error =>
                    `${error.status} - ${error.title}: ${error.detail}`
                ).join('<br>');

                if (response.status === 429) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Too many requests. Please wait and try again.");
                }

                // Show api errors
                document.getElementById("apiErrorMessage").textContent = errorMessages;
                document.getElementById("apiError").style.display = "block";
                document.getElementById("vehicleResultsPreview").style.display = "none";
                document.getElementById("addVehicleForm").style.display = "none";
            } else {
                // Show preview with the data
                document.getElementById("previewMake").textContent = data.make || "";
                document.getElementById("previewReg").textContent = data.registrationNumber || "";
                document.getElementById("previewFuel").textContent = data.fuelType || "";
                document.getElementById("previewColour").textContent = data.colour || "";
                document.getElementById("previewEngineSize").textContent = data.engineCapacity || "";
                document.getElementById("previewFirstReg").textContent = data.monthOfFirstRegistration || "";
                document.getElementById("previewCreated").textContent = data.yearOfManufacture || "";
                document.getElementById("previewEuro").textContent = data.euroStatus || "";
                document.getElementById("previewCO2").textContent = data.co2Emissions || "";

                document.getElementById("vehicleResultsPreview").style.display = "block";
                document.getElementById("apiError").style.display = "none";
                document.getElementById("addVehicleForm").style.display = "none";
            }
        } catch (error) {
            // Show other errors
            document.getElementById("apiErrorMessage").textContent = error;
            document.getElementById("apiError").style.display = "block";
            document.getElementById("vehicleResultsPreview").style.display = "none";
            document.getElementById("addVehicleForm").style.display = "none";
        }
    });

    // Add event listener for the confirm button
    document.getElementById("confirmDetailsBtn").addEventListener("click", function() {
        // Transfer data from preview to form
        document.getElementById("vehicleMake").value = document.getElementById("previewMake").textContent;
        document.getElementById("vehicleReg").value = document.getElementById("previewReg").textContent;
        document.getElementById("vehicleFuel").value = document.getElementById("previewFuel").textContent;
        document.getElementById("vehicleColour").value = document.getElementById("previewColour").textContent;
        document.getElementById("vehicleEngineSize").value = document.getElementById("previewEngineSize").textContent;
        document.getElementById("vehicleFirstReg").value = document.getElementById("previewFirstReg").textContent;
        document.getElementById("vehicleCreated").value = document.getElementById("previewCreated").textContent;
        document.getElementById("vehicleEuro").value = document.getElementById("previewEuro").textContent;
        document.getElementById("vehicleCO2").value = document.getElementById("previewCO2").textContent;

        // Show form and hide preview
        document.getElementById("addVehicleForm").style.display = "block";
        document.getElementById("vehicleResultsPreview").style.display = "none";
    });
});