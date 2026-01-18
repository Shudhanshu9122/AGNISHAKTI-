/**
 * Auto GPS Capture for Responder Registration
 * Add this code to LandingPage.jsx handleProviderRegister function
 */

// STEP 1: Add this BEFORE the user registration
// ============================================

console.log('📍 Capturing GPS location...');
showToast('Detecting your fire station location...');

let coords = null;

if (navigator.geolocation) {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });

        coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        console.log('✅ GPS location captured:', coords);
        showToast(`Location captured: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);

    } catch (gpsError) {
        console.warn('GPS capture failed:', gpsError);
        showToast('GPS unavailable, using default location', 'warning');
        coords = { lat: 0, lng: 0 };
    }
} else {
    console.warn('Geolocation not supported');
    showToast('GPS not supported, using default location', 'warning');
    coords = { lat: 0, lng: 0 };
}

// STEP 2: Add this AFTER user registration succeeds
// ==================================================

// Register fire station with GPS coordinates
console.log('Registering fire station with GPS coordinates...');

try {
    const stationResponse = await axios.post('/api/stations/register', {
        email: currentUser.email,
        name: currentUser.displayName || currentUser.email.split('@')[0],
        stationName: `Fire Station - ${currentUser.displayName || currentUser.email.split('@')[0]}`,
        stationAddress: 'Auto-detected location',
        stationPhone: 'N/A',
        coords: coords
    }, {
        headers: {
            'x-provider-secret': process.env.NEXT_PUBLIC_PROVIDER_SECRET || 'a-very-strong-and-secret-key-12345'
        }
    });

    console.log('✅ Fire station registered with GPS:', stationResponse.data);
    showToast('Fire station location saved successfully!');

} catch (stationError) {
    console.error('Fire station registration failed:', stationError);
    // Continue anyway - user is registered, just station location failed
    showToast('Warning: Station location not saved', 'warning');
}

// COMPLETE UPDATED FUNCTION
// =========================

const handleProviderRegister = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const CORRECT_PASSWORD = 'password123';

    if (providerPassword !== CORRECT_PASSWORD) {
        setError('Incorrect password. Please try again.');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        console.log('Starting provider registration for:', currentUser.email);

        // AUTO-CAPTURE GPS LOCATION
        console.log('📍 Capturing GPS location...');
        showToast('Detecting your fire station location...');

        let coords = null;

        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        resolve,
                        reject,
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        }
                    );
                });

                coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                console.log('✅ GPS location captured:', coords);
                showToast(`Location captured: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);

            } catch (gpsError) {
                console.warn('GPS capture failed:', gpsError);
                showToast('GPS unavailable, using default location', 'warning');
                coords = { lat: 0, lng: 0 };
            }
        } else {
            console.warn('Geolocation not supported');
            showToast('GPS not supported, using default location', 'warning');
            coords = { lat: 0, lng: 0 };
        }

        // REGISTER USER
        console.log('User data:', {
            email: currentUser.email,
            name: currentUser.displayName,
            role: 'provider'
        });

        const userResponse = await axios.post('/auth/register', {
            email: currentUser.email,
            name: currentUser.displayName,
            role: 'provider'
        });

        console.log('User registration response:', userResponse.data);

        // REGISTER FIRE STATION WITH GPS
        console.log('Registering fire station with GPS coordinates...');

        try {
            const stationResponse = await axios.post('/api/stations/register', {
                email: currentUser.email,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                stationName: `Fire Station - ${currentUser.displayName || currentUser.email.split('@')[0]}`,
                stationAddress: 'Auto-detected location',
                stationPhone: 'N/A',
                coords: coords
            }, {
                headers: {
                    'x-provider-secret': process.env.NEXT_PUBLIC_PROVIDER_SECRET || 'a-very-strong-and-secret-key-12345'
                }
            });

            console.log('✅ Fire station registered with GPS:', stationResponse.data);
            showToast('Fire station location saved successfully!');

        } catch (stationError) {
            console.error('Fire station registration failed:', stationError);
            showToast('Warning: Station location not saved', 'warning');
        }

        showToast('Registration successful! Redirecting to dashboard...');
        setModalState(null);
        setProviderForm({});

        router.push('/provider/dashboard');

    } catch (err) {
        console.error('Provider registration error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);

        if (err.response?.status === 400) {
            setError(err.response?.data?.error || 'Invalid registration data');
        } else if (err.response?.status === 500) {
            setError('Server error. Please try again later.');
        } else {
            setError(err.response?.data?.error || 'Registration failed');
        }
    } finally {
        setIsLoading(false);
    }
};
