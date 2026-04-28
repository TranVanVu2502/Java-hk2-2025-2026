import { createContext, useContext, useState, useEffect } from 'react';
import { farmService } from '../api/services';

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
    const [myFarm, setMyFarm] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        farmService.getMyFarms()
            .then(res => {
                const farms = res.data || [];
                if (farms.length > 0) setMyFarm(farms[0]);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    return (
        <FarmContext.Provider value={{ myFarm, setMyFarm, loading, reload: load }}>
            {children}
        </FarmContext.Provider>
    );
}

export const useFarm = () => useContext(FarmContext);
