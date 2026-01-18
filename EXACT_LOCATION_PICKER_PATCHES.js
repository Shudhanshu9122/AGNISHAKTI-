/**
 * EXACT CODE TO ADD TO LandingPage.jsx
 * Follow these steps carefully
 */

// ============================================
// STEP 1: Add import at the top (around line 26)
// ============================================
import LocationPicker from './LocationPicker';


// ============================================
// STEP 2: Add state variables (around line 46, after providerPassword)
// ============================================
const [showResponderLocationPicker, setShowResponderLocationPicker] = useState(false);
const [responderLocation, setResponderLocation] = useState(null);


// ============================================
// STEP 3: Add handler function (around line 150, before handleProviderRegister)
// ============================================
const handleResponderLocationSelect = (locationData) => {
    setResponderLocation({
        lat: locationData.latitude,
        lng: locationData.longitude
    });
    setShowResponderLocationPicker(false);
    showToast(`Fire station location: ${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`);
};


// ============================================
// STEP 4: Replace the provider-register modal section
// Find lines 552-591 and replace with this:
// ============================================
{
    modalState === 'provider-register' && (
        <div className="text-center space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Emergency Responder Registration</h3>
                <p className="text-gray-300 mb-2">Email: {currentUser?.email}</p>
                <p className="text-gray-300 mb-4">Name: {currentUser?.displayName}</p>
            </div>

            {/* LOCATION PICKER SECTION - NEW */}
            <div className="space-y-3 text-left">
                <label className="block text-sm font-medium text-gray-300">
                    🚒 Fire Station Location
                </label>

                {responderLocation ? (
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 font-semibold">✅ Location Selected</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowResponderLocationPicker(true)}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm transition-all"
                            >
                                Change
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-400">Latitude</p>
                                <p className="text-white font-mono">{responderLocation.lat.toFixed(6)}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Longitude</p>
                                <p className="text-white font-mono">{responderLocation.lng.toFixed(6)}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowResponderLocationPicker(true)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                    >
                        <MapPin className="w-5 h-5" />
                        Select Fire Station Location
                    </button>
                )}

                <p className="text-gray-400 text-xs text-center">
                    📍 GPS will auto-detect your location, or select manually on the map
                </p>
            </div>

            {/* PASSWORD INPUT */}
            <input
                type="password"
                value={providerPassword}
                onChange={(e) => setProviderPassword(e.target.value)}
                placeholder="Enter Secret Password (password123)"
                className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />

            {/* ERROR MESSAGE */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* BUTTONS */}
            <div className="space-y-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProviderRegister}
                    disabled={isLoading || !responderLocation}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                    {isLoading ? 'Registering...' : 'Register as Emergency Responder'}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setModalState('choose-role')}
                    className="w-full px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
                >
                    Back to Role Selection
                </motion.button>
            </div>
        </div>
    )
}


// ============================================
// STEP 5: Add LocationPicker modal at the very end
// Find the end of the return statement (around line 805, before </div>)
// Add this BEFORE the closing </div>:
// ============================================
{/* LocationPicker Modal for Responder */ }
{
    showResponderLocationPicker && (
        <LocationPicker
            onLocationSelect={handleResponderLocationSelect}
            onClose={() => setShowResponderLocationPicker(false)}
            initialLocation={responderLocation}
        />
    )
}


// ============================================
// STEP 6: Update handleProviderRegister function
// Find the function (around line 155) and add validation:
// ============================================
const handleProviderRegister = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const CORRECT_PASSWORD = 'password123';

    if (providerPassword !== CORRECT_PASSWORD) {
        setError('Incorrect password. Please try again.');
        return;
    }

    // ADD THIS VALIDATION
    if (!responderLocation) {
        setError('Please select your fire station location on the map');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        console.log('Starting provider registration for:', currentUser.email);
        console.log('Fire station location:', responderLocation);

        const userResponse = await axios.post('/auth/register', {
            email: currentUser.email,
            name: currentUser.displayName,
            role: 'provider'
        });

        console.log('User registration response:', userResponse.data);

        // ADD THIS: Register fire station with GPS
        try {
            const stationResponse = await axios.post('/api/stations/register', {
                email: currentUser.email,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                stationName: `Fire Station - ${currentUser.displayName || currentUser.email.split('@')[0]}`,
                stationAddress: 'Location selected on map',
                stationPhone: 'N/A',
                coords: responderLocation
            }, {
                headers: {
                    'x-provider-secret': process.env.NEXT_PUBLIC_PROVIDER_SECRET || 'a-very-strong-and-secret-key-12345'
                }
            });

            console.log('✅ Fire station registered:', stationResponse.data);
            showToast('Fire station location saved!');

        } catch (stationError) {
            console.error('Station registration failed:', stationError);
            showToast('Warning: Station location not saved', 'warning');
        }

        showToast('Registration successful! Redirecting to dashboard...');
        setModalState(null);
        setProviderForm({});
        setProviderPassword('');
        setResponderLocation(null); // ADD THIS

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
