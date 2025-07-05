document.addEventListener('DOMContentLoaded', function() {
    // Edit Vehicle Modal Setup
    const editVehicleModal = new bootstrap.Modal(document.getElementById('editVehicleModal'));
    const editVehicleForm = document.getElementById('editVehicleForm');
    const saveVehicleChangesBtn = document.getElementById('saveVehicleChanges');
    const editVehicleToast = new bootstrap.Toast(document.getElementById('editVehicleToast'));
    
    // Edit buttons event listeners
    document.querySelectorAll('.btn-outline-warning').forEach(button => {
        button.addEventListener('click', function() {
            const vehicleCard = this.closest('.vehicle-card');
            const vehicleId = vehicleCard.dataset.id;
            
            // Fetch vehicle details from the card data attributes
            document.getElementById('editVehicleId').value = vehicleId;
            document.getElementById('editMake').value = vehicleCard.dataset.make;
            document.getElementById('editModel').value = vehicleCard.dataset.model;
            document.getElementById('editReg').value = vehicleCard.dataset.reg;
            document.getElementById('editType').value = vehicleCard.dataset.type;
            document.getElementById('editMileage').value = vehicleCard.dataset.mileage;
            document.getElementById('editPrice').value = vehicleCard.dataset.price;
            document.getElementById('editTrans').value = vehicleCard.dataset.trans;
            document.getElementById('editFuelType').value = vehicleCard.dataset.fuel_type || 'PETROL';
            document.getElementById('editEngineCC').value = vehicleCard.dataset.engine_cc || '';
            document.getElementById('editColour').value = vehicleCard.dataset.colour || '';
            document.getElementById('editFirstReg').value = vehicleCard.dataset.first_reg || '';
            document.getElementById('editCategory').value = vehicleCard.dataset.category || 'None';
            
            editVehicleModal.show();
        });
    });
    
    // Save changes handler
    saveVehicleChangesBtn.addEventListener('click', async function() {
        const formData = new FormData(editVehicleForm);
        const vehicleId = formData.get('vehicle_id');
        
        try {
            const response = await fetch(`/api/vehicles/${vehicleId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update the card with new data without reloading
                updateVehicleCard(vehicleId, result.vehicle);
                
                // Show success toast
                document.getElementById('toastTitle').innerHTML = '<i class="bi bi-cloud-check-fill"></i> Success';
                document.getElementById('toastMessage').innerHTML = 'Vehicle updated successfully!';
                document.getElementById('editVehicleToast').classList.remove('bg-danger');
                document.getElementById('editVehicleToast').classList.add('bg-success');
                editVehicleToast.show();
                
                // Close the modal
                editVehicleModal.hide();
            } else {
                throw new Error(result.error || 'Failed to update vehicle');
            }
        } catch (error) {
            // Show error toast
            document.getElementById('toastTitle').innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Error';
            document.getElementById('toastMessage').innerHTML = error.message;
            document.getElementById('editVehicleToast').classList.remove('bg-success');
            document.getElementById('editVehicleToast').classList.add('bg-danger');
            editVehicleToast.show();
        }
    });
    
    // Function to update the vehicle card with new data
    function updateVehicleCard(vehicleId, vehicleData) {
        const vehicleCard = document.querySelector(`.vehicle-card[data-id="${vehicleId}"]`);
        
        if (!vehicleCard) {
            console.error(`Vehicle card with ID ${vehicleId} not found`);
            return;
        }

        // Update data attributes
        vehicleCard.dataset.make = vehicleData.make;
        vehicleCard.dataset.model = vehicleData.model;
        vehicleCard.dataset.reg = vehicleData.reg;
        vehicleCard.dataset.type = vehicleData.vehicle_type;
        vehicleCard.dataset.mileage = vehicleData.mileage;
        vehicleCard.dataset.price = vehicleData.price;
        vehicleCard.dataset.trans = vehicleData.trans;
        vehicleCard.dataset.fuel_type = vehicleData.fuel_type;
        vehicleCard.dataset.engine_cc = vehicleData.engine_cc || '';
        vehicleCard.dataset.colour = vehicleData.colour || '';
        vehicleCard.dataset.first_reg = vehicleData.first_reg || '';
        vehicleCard.dataset.category = vehicleData.category || 'None';

        // Safely update visible elements
        const card = vehicleCard.querySelector('.listings-card');
        if (!card) {
            console.error('Card element not found');
            return;
        }

        // Update make, model, and type
        const titleElement = card.querySelector('.card-title');
        const modelElement = card.querySelector('.card-model');
        const typeElement = card.querySelector('.card-type');
        if (titleElement) titleElement.textContent = vehicleData.make;
        if (modelElement) modelElement.textContent = vehicleData.model;
        if (typeElement) typeElement.textContent = vehicleData.vehicle_type;

        // Update price
        const priceElement = card.querySelector('.listing-price');
        if (priceElement) {
            priceElement.textContent = vehicleData.price == 0 ? 
                'Due In' : `£${vehicleData.price.toLocaleString()}`;
        }

        // Update mileage, transmission, and fuel type in the info row
        const infoRow = card.querySelector('.row');
        if (infoRow) {
            // Mileage
            const mileageElement = infoRow.querySelector('[data-miles]') || 
                                infoRow.querySelector('.col-6:nth-child(1) p');
            if (mileageElement) {
                mileageElement.innerHTML = `<i class="bi bi-speedometer2 h6"></i> ${vehicleData.mileage.toLocaleString()}`;
            }

            // Transmission
            const transElement = infoRow.querySelector('[data-trans]') || 
                                infoRow.querySelector('.col-6:nth-child(2) p');
            if (transElement) {
                transElement.innerHTML = `<i class="bi bi-gear h6"></i> ${
                    vehicleData.trans === "Automatic" ? "Auto" : vehicleData.trans
                }`;
            }

            // Fuel type
            const fuelElement = infoRow.querySelector('[data-fuel]') || 
                            infoRow.querySelector('.col-6:nth-child(4) p');
            if (fuelElement) {
                fuelElement.innerHTML = vehicleData.fuel_type === "ELECTRICITY" ?
                    `<i class="bi bi-lightning-charge h6"></i> EV` :
                    `<i class="bi bi-fuel-pump h6"></i> ${
                        vehicleData.fuel_type ? 
                        vehicleData.fuel_type.charAt(0).toUpperCase() + vehicleData.fuel_type.slice(1).toLowerCase() : 
                        'N/A'
                    }`;
            }
        }

        // Update color badge
        const colorBadge = card.querySelector('.badge');
        if (colorBadge) {
            if (vehicleData.colour) {
                colorBadge.textContent = vehicleData.colour;
                colorBadge.style.backgroundColor = vehicleData.colour.toLowerCase();
                colorBadge.style.color = ['white', 'yellow', 'silver'].includes(vehicleData.colour.toLowerCase()) ? 
                    'black' : 'white';
            } else {
                colorBadge.textContent = 'N/A';
                colorBadge.style.backgroundColor = '';
                colorBadge.style.color = '';
            }
        }
    }
});