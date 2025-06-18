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

                document.getElementById("apiErrorMessage").textContent = errorMessages;
                document.getElementById("apiError").style.display = "block";
                document.getElementById("addVehicleForm").style.display = "none";
            } else {
                document.getElementById("vehicleMake").value = data.make || "";
                document.getElementById("vehicleReg").value = data.registrationNumber || "";
                document.getElementById("vehicleFuel").value = data.fuelType || "";
                document.getElementById("vehicleColour").value = data.colour || "";
                document.getElementById("vehicleEngineSize").value = data.engineCapacity || "";
                document.getElementById("vehicleFirstReg").value = data.monthOfFirstRegistration || "";
                document.getElementById("vehicleCreated").value = data.yearOfManufacture || "";
                document.getElementById("vehicleEuro").value = data.euroStatus || "";
                document.getElementById("vehicleCO2").value = data.co2Emissions || "";

                document.getElementById("addVehicleForm").style.display = "block";
                document.getElementById("apiError").style.display = "none";
            }
        } catch (error) {
            document.getElementById("apiErrorMessage").textContent = error;
            document.getElementById("apiError").style.display = "block";
            document.getElementById("addVehicleForm").style.display = "none";
        }
    });

});