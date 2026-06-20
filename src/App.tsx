import React, { useState, useEffect, useMemo } from 'react';
import { CRMData, Customer, AuditLog } from './types';
import { loadCRMData, saveCRMData, hashPassword, fetchServerCRMData, saveServerCRMData } from './storage';
import Sidebar from './components/Sidebar';
import AdminCRM from './components/AdminCRM';
import CustomerPortal from './components/CustomerPortal';
import { Lock, User, FileText, LayoutDashboard, Key, ShieldAlert, Check, X } from 'lucide-react';

const getPasswordRules = (password: string) => {
  return [
    { label: 'Mindestens 8 Zeichen', met: password.length >= 8 },
    { label: 'Ein Großbuchstabe (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Ein Kleinbuchstabe (a-z)', met: /[a-z]/.test(password) },
    { label: 'Eine Ziffer (0-9)', met: /[0-9]/.test(password) },
    { label: 'Ein Sonderzeichen (z.B. !@#_)', met: /[^A-Za-z0-9]/.test(password) }
  ];
};

const getPasswordStrength = (password: string) => {
  if (!password) {
    return { score: 0, label: 'Kein Passwort eingegeben', bgClass: 'bg-slate-850', textColor: 'text-slate-450' };
  }
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const classesCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (classesCount >= 2) score += 1;
  if (classesCount >= 3) score += 1;
  if (score === 0) score = 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Sehr schwach', bgClass: 'bg-rose-500', textColor: 'text-rose-450' };
    case 2:
      return { score: 2, label: 'Schwach', bgClass: 'bg-amber-500', textColor: 'text-amber-450' };
    case 3:
      return { score: 3, label: 'Mittelstark', bgClass: 'bg-yellow-500', textColor: 'text-yellow-400' };
    case 4:
    default:
      return { score: 4, label: 'Stark & Sicher', bgClass: 'bg-emerald-500', textColor: 'text-emerald-400' };
  }
};

const generateStrongPassword = (customSpecialChars?: string): string => {
  const length = 15;
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const special = customSpecialChars !== undefined ? customSpecialChars : "!@#$%&*?_-";
  const hasSpecial = special.length > 0;
  const allChars = lowercase + uppercase + digits + special;

  // Guarantee at least one character from each class to satisfy strong metrics
  let chars: string[] = [];
  chars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
  chars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
  chars.push(digits[Math.floor(Math.random() * digits.length)]);
  if (hasSpecial) {
    chars.push(special[Math.floor(Math.random() * special.length)]);
  }

  const startLen = hasSpecial ? 4 : 3;
  for (let i = startLen; i < length; i++) {
    chars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Durstenfeld shuffle (Fisher-Yates) for perfect randomness
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  return chars.join('');
};

export default function App() {
  // --- APPLICATION STATE ---
  const [data, setData] = useState<CRMData>(loadCRMData());

  const addAuditLog = (action: string, user: string, details: string, status: 'success' | 'failure' | 'warning' | 'info') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      action,
      user,
      details,
      status,
      ipAddress: '127.0.0.1 (Lokale Sitzung)'
    };
    setData(prev => ({
      ...prev,
      auditLogs: [newLog, ...(prev.auditLogs || [])]
    }));
  };
  const [session, setSession] = useState<{
    role: 'admin' | 'customer';
    userId: string; // 'admin' or customerId
    displayName: string;
    companyName?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // --- CONNECTION MODE (ONLINE/OFFLINE SYNC) ---
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const cached = localStorage.getItem('crm_online_mode');
    return cached !== 'offline';
  });

  const handleSetOnline = (onlineValue: boolean) => {
    setIsOnline(onlineValue);
    localStorage.setItem('crm_online_mode', onlineValue ? 'online' : 'offline');
  };

  // --- LOGIN PANEL STATE ---
  const [loginRole, setLoginRole] = useState<'admin' | 'customer'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- REGISTRATION STATE ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  // --- PASSWORD GENERATOR CONFIG STATE ---
  const [allowedSpecialSymbols, setAllowedSpecialSymbols] = useState<string[]>(['!', '@', '#', '$', '%', '&', '*', '?', '_', '-']);

  // --- LOGIN LOCKOUT STATE ---
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState<number>(0);

  // --- BRUTE FORCE LOCKOUT TICKER ---
  useEffect(() => {
    if (lockoutUntil === null) return;

    const intervalId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutCountdown(remaining);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedLoginAttempts(0);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lockoutUntil]);

  // Synchronize state changes directly with localStorage and the server if online
  useEffect(() => {
    saveCRMData(data);
    if (isOnline) {
      saveServerCRMData(data).catch(err => {
        console.error('Failed to sync changes to server', err);
      });
    }
  }, [data, isOnline]);

  // Load backend data on startup and poll periodically to stay in sync with server state
  useEffect(() => {
    let isMounted = true;

    async function syncWithServer() {
      if (!isOnline) return;
      try {
        const serverData = await fetchServerCRMData();
        if (isMounted) {
          setData(prev => {
            // Structurally compare serialized data to prevent unneeded re-renders
            if (JSON.stringify(prev) === JSON.stringify(serverData)) {
              return prev;
            }
            return serverData;
          });
        }
      } catch (err) {
        console.error('Error fetching newest database state from server', err);
      }
    }

    syncWithServer();

    const intervalId = setInterval(() => {
      syncWithServer();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isOnline]);

  // Try to recover session from sessionStorage for browser refreshes
  useEffect(() => {
    const cachedSession = sessionStorage.getItem('crm_active_session');
    if (cachedSession) {
      try {
        const parsed = JSON.parse(cachedSession);
        // Verify user still exists in current db context if they are a customer
        if (parsed.role === 'customer') {
          const userExists = data.customers.some(c => c.id === parsed.userId);
          if (userExists) {
            setSession(parsed);
          } else {
            sessionStorage.removeItem('crm_active_session');
          }
        } else {
          setSession(parsed);
        }
      } catch (e) {
        console.error('Error recovering session cache', e);
      }
    }
  }, [data.customers]);

  // Global Keyboard Shortcuts (Ctrl+K: Search / Ctrl+D: Dashboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!session) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl) {
        const key = e.key.toLowerCase();
        
        if (key === 'k') {
          e.preventDefault();
          if (session.role === 'admin') {
            setActiveTab('customers');
            setTimeout(() => {
              const searchInput = document.getElementById('customer-search-input');
              if (searchInput) {
                searchInput.focus();
                (searchInput as HTMLInputElement).select();
              }
            }, 100);
          } else {
            setActiveTab('inventory');
            setTimeout(() => {
              const searchInput = document.getElementById('customer-product-search-input');
              if (searchInput) {
                searchInput.focus();
                (searchInput as HTMLInputElement).select();
              }
            }, 100);
          }
        } else if (key === 'd') {
          e.preventDefault();
          setActiveTab('dashboard');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [session]);

  // --- CALCULATE UNREAD MESSAGE BADGES ---
  const unreadMessagesCount = useMemo(() => {
    if (!session) return 0;
    if (session.role === 'admin') {
      // Messages to admin that are still unread
      return data.messages.filter(m => m.receiverId === 'admin' && !m.isRead).length;
    } else {
      // Messages from admin to this specific customer that are still unread
      return data.messages.filter(
        m => m.senderId === 'admin' && m.receiverId === session.userId && !m.isRead
      ).length;
    }
  }, [data.messages, session]);

  // --- AUTHENTICATION ACTIONS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError('Bitte füllen Sie alle Anmeldefelder aus.');
      return;
    }

    if (lockoutUntil !== null && Date.now() < lockoutUntil) {
      setLoginError(`Sicherheitssperre aktiv: Zu viele fehlerhafte Anmeldeversuche. Bitte warten Sie noch ${lockoutCountdown} Sekunden.`);
      return;
    }

    setLoginError(null);
    setIsVerifying(true);

    try {
      if (loginRole === 'admin') {
        const adminHash = data.adminProfile?.passwordHash || "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // SHA255 of 'admin123'
        const computedHash = await hashPassword(password);
        
        if (username.toLowerCase() === 'admin' && computedHash === adminHash) {
          const newSession = {
            role: 'admin' as const,
            userId: 'admin',
            displayName: data.adminProfile?.name || 'Administrator',
            companyName: data.adminProfile?.company || 'CRM Portal'
          };
          
          // Increment admin login counter for backup reminders
          const currentCount = parseInt(localStorage.getItem('admin_login_count') || '0', 10);
          localStorage.setItem('admin_login_count', (currentCount + 1).toString());

          // Reset failure states
          setFailedLoginAttempts(0);
          setLockoutUntil(null);
          setLockoutCountdown(0);

          addAuditLog('Anmeldung erfolgreich', 'admin', 'Erfolgreiche Anmeldung des Administrators', 'success');

          setSession(newSession);
          sessionStorage.setItem('crm_active_session', JSON.stringify(newSession));
          setActiveTab('dashboard');
        } else {
          const newAttempts = failedLoginAttempts + 1;
          setFailedLoginAttempts(newAttempts);
          if (newAttempts >= 5) {
            setLockoutUntil(Date.now() + 30 * 1000);
            setLockoutCountdown(30);
            setLoginError('Sicherheitssperre aktiv: Zu viele fehlerhafte Anmeldeversuche. Bitte warten Sie 30 Sekunden.');
            addAuditLog('Sicherheitssperre aktiviert', 'admin', '30 Sekunden Sperre aufgrund von 5 fehlerhaften Login-Versuchen aktiviert', 'warning');
          } else {
            setLoginError(`Ungültige Administrator-Zugangsdaten. (Versuch ${newAttempts} von 5)`);
            addAuditLog('Anmeldung fehlgeschlagen', 'admin', `Ungültiger Login-Versuch als Administrator (Versuch ${newAttempts} von 5)`, 'failure');
          }
        }
      } else {
        // Customer login lookup
        const customer = data.customers.find(
          c => c.username.toLowerCase() === username.toLowerCase()
        );
        if (customer) {
          const computedHash = await hashPassword(password);
          if (computedHash === customer.passwordHash) {
            if (customer.approved === false) {
              setLoginError('Ihr Zugang wurde erfolgreich registriert, muss jedoch erst durch den Administrator freigeschaltet werden.');
              addAuditLog('Anmeldung blockiert', customer.username, `Login blockiert: Kunden-Konto ist noch nicht durch Admin freigeschaltet`, 'info');
              return;
            }
            const newSession = {
              role: 'customer' as const,
              userId: customer.id,
              displayName: customer.name,
              companyName: customer.company
            };

            // Reset failure states
            setFailedLoginAttempts(0);
            setLockoutUntil(null);
            setLockoutCountdown(0);

            addAuditLog('Anmeldung erfolgreich', customer.username, `Erfolgreiche Anmeldung des Kunden ${customer.name}`, 'success');

            setSession(newSession);
            sessionStorage.setItem('crm_active_session', JSON.stringify(newSession));
            setActiveTab('dashboard');
          } else {
            const newAttempts = failedLoginAttempts + 1;
            setFailedLoginAttempts(newAttempts);
            if (newAttempts >= 5) {
              setLockoutUntil(Date.now() + 30 * 1000);
              setLockoutCountdown(30);
              setLoginError('Sicherheitssperre aktiv: Zu viele fehlerhafte Anmeldeversuche. Bitte warten Sie 30 Sekunden.');
              addAuditLog('Sicherheitssperre aktiviert', customer.username, '30 Sekunden Sperre aufgrund von 5 fehlerhaften Login-Versuchen aktiviert', 'warning');
            } else {
              setLoginError(`Ungültiges Passwort für diesen Kunden. (Versuch ${newAttempts} von 5)`);
              addAuditLog('Anmeldung fehlgeschlagen', customer.username, `Fehlerhaftes Passwort eingegeben (Versuch ${newAttempts} von 5)`, 'failure');
            }
          }
        } else {
          const newAttempts = failedLoginAttempts + 1;
          setFailedLoginAttempts(newAttempts);
          if (newAttempts >= 5) {
            setLockoutUntil(Date.now() + 30 * 1000);
            setLockoutCountdown(30);
            setLoginError('Sicherheitssperre aktiv: Zu viele fehlerhafte Anmeldeversuche. Bitte warten Sie 30 Sekunden.');
            addAuditLog('Sicherheitssperre aktiviert', username || 'unbekannt', '30 Sekunden Sperre aufgrund von 5 fehlerhaften Login-Versuchen aktiviert', 'warning');
          } else {
            setLoginError(`Kundenbenutzername existiert nicht. (Versuch ${newAttempts} von 5)`);
            addAuditLog('Anmeldung fehlgeschlagen', username || 'unbekannt', `Kundenbenutzername existiert nicht (Versuch ${newAttempts} von 5)`, 'failure');
          }
        }
      }
    } catch (err) {
      console.error('Error during authentication', err);
      setLoginError('Ein Anmeldefehler ist aufgetreten.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    if (session) {
      addAuditLog('Abmeldung', session.userId, `Sitzung beendet von ${session.displayName}`, 'info');
    }
    setSession(null);
    sessionStorage.removeItem('crm_active_session');
    setUsername('');
    setPassword('');
    setLoginError(null);
  };

  // --- INACTIVITY AUTO LOGOUT (15 MINUTES) WITH PROGRESS BAR ---
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);

  useEffect(() => {
    if (!session) return;

    const INACTIVITY_TIMEOUT_SECONDS = 15 * 60; // 15 minutes
    let secondsLeft = INACTIVITY_TIMEOUT_SECONDS;
    setSecondsRemaining(secondsLeft);

    let intervalId: NodeJS.Timeout;

    const resetTimer = () => {
      secondsLeft = INACTIVITY_TIMEOUT_SECONDS;
      setSecondsRemaining(secondsLeft);
    };

    // Update remaining time every second
    intervalId = setInterval(() => {
      secondsLeft -= 1;
      setSecondsRemaining(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(intervalId);
        handleLogout();
        alert('Sitzung abgelaufen: Sie wurden aufgrund von 15 Minuten Inaktivität automatisch abgemeldet, um Ihre Daten auf diesem Gerät zu schützen.');
      }
    }, 1000);

    // Listen to user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      clearInterval(intervalId);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [session]);

  // --- CLIENT REGISTRATION SUBMIT ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regUsername || !regPassword) {
      setRegError('Bitte füllen Sie alle erforderlichen Felder aus (*).');
      return;
    }

    setRegError(null);
    setRegSuccess(false);

    // Validate if username already exists
    const existingUser = data.customers.some(
      c => c.username.toLowerCase() === regUsername.toLowerCase()
    );
    if (existingUser || regUsername.toLowerCase() === 'admin') {
      setRegError('Dieser Benutzername ist bereits vergeben.');
      return;
    }

    try {
      const computedHash = await hashPassword(regPassword);
      const newCustomer: Customer = {
        id: `cust-reg-${Date.now()}`,
        name: regName,
        company: regCompany || 'Privatkunde',
        email: regEmail,
        phone: regPhone,
        address: regAddress || 'Keine Angabe',
        status: 'Neukunde',
        username: regUsername,
        passwordHash: computedHash,
        notes: 'Selbstregistrierter Mandant. Wartet auf administrative Freigabe.',
        createdAt: new Date().toISOString(),
        approved: false // always pending activation via admin!
      };

      setData(prev => ({
        ...prev,
        customers: [...prev.customers, newCustomer]
      }));

      addAuditLog('Benutzerregistrierung', regUsername, `Kunde '${regName}' (${regCompany || 'Privatkunde'}) hat sich registriert (wartet auf administrative Freigabe)`, 'info');

      setRegSuccess(true);
      // Reset registration form
      setRegName('');
      setRegCompany('');
      setRegEmail('');
      setRegPhone('');
      setRegAddress('');
      setRegUsername('');
      setRegPassword('');
      setShowRegPassword(false);
    } catch (err) {
      console.error('Error registering customer:', err);
      setRegError('Fehler bei der Registrierung.');
    }
  };

  // --- CUSTOM COMPACT DEMO SHORTCUT REGISTER ---
  const triggerQuickDemoLogin = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setLoginRole('admin');
      setUsername('admin');
      setPassword('admin123');
    } else {
      setLoginRole('customer');
      setUsername('max.muster');
      setPassword('kunde123');
    }
  };

  // Resolve active customer file database model when customer is logged in
  const loggedInCustomer = useMemo(() => {
    if (session?.role === 'customer') {
      return data.customers.find(c => c.id === session.userId);
    }
    return null;
  }, [data.customers, session]);

  // --- RENDERING PAGE CHASSIS ---
  return (
    <div className="flex h-screen w-screen bg-slate-100 font-sans overflow-hidden antialiased">
      {session ? (
        /* APPLICAION ACTIVE PORTAL VIEW */
        <div className="flex w-full h-full">
          <Sidebar
            role={session.role}
            displayName={session.role === 'admin' ? (data.adminProfile?.name || 'Administrator') : (data.customers.find(c => c.id === session.userId)?.name || session.displayName)}
            companyName={session.role === 'admin' ? (data.adminProfile?.company || 'CRM Portal') : (data.customers.find(c => c.id === session.userId)?.company || session.companyName)}
            currentTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            unreadCount={unreadMessagesCount}
          />
          
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            {session.role === 'admin' ? (
              <AdminCRM
                data={data}
                onDataChange={setData}
                activeTab={activeTab}
                isOnline={isOnline}
                onOnlineToggle={handleSetOnline}
                onTabChange={setActiveTab}
                secondsRemaining={secondsRemaining}
              />
            ) : (
              loggedInCustomer ? (
                <CustomerPortal
                  customer={loggedInCustomer}
                  data={data}
                  onDataChange={setData}
                  activeTab={activeTab}
                  isOnline={isOnline}
                  onOnlineToggle={handleSetOnline}
                  onTabChange={setActiveTab}
                />
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono">
                  Sitzungsfehler: Kundenprofil nicht in lokaler Mappe gefunden.
                </div>
              )
            )}
          </main>
        </div>
      ) : (
        /* APP GATEWAY LOGIN VIEW */
        <div className="flex w-full h-full lg:grid lg:grid-cols-2 overflow-hidden bg-slate-900 select-none">
          {/* LEFT PANEL: Branding & Visuals */}
          <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-slate-950 to-slate-900 text-white relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
            
            {/* Logo */}
            <div className="flex items-center space-x-3.5 relative z-10">
              <div className="p-2 bg-blue-600/15 text-blue-400 rounded-xl border border-blue-500/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight uppercase leading-none">CRM {data.adminProfile?.company || 'Admin Portal'}</h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">Offline-Zentrale & Corporate Vault</p>
              </div>
            </div>

            {/* Intro typography */}
            <div className="max-w-md space-y-4 relative z-10">
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
                Die sichere Offline-Zentrale für Ihre Kundendaten.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dieses Portal arbeitet vollständig in Ihrer lokalen Sandbox. Ohne externe Server, ohne Cloud oder Python-Dienste. Ihre Verträge, Dateiverläufe und Videoübertragungen bleiben immer auf Ihrem Computer geschützt.
              </p>
            </div>

            {/* Micro Credit Indicator */}
            <div className="flex items-center justify-center text-xs text-slate-500 font-mono relative z-10 border-t border-slate-800/80 pt-6">
              <span>Ablage-Zentrale geladen für: {data.adminProfile?.name || 'Administrator'}</span>
            </div>
          </div>

          {/* RIGHT PANEL: Dynamic Form */}
          <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-950 relative overflow-y-auto">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent"></div>
            
            <div className="w-full max-w-md space-y-8 relative z-10 py-6">
              {isRegistering ? (
                /* CLIENT REGISTRATION FORM */
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase">Mandanten-Registrierung</h2>
                    <p className="text-xs text-slate-400 mt-1">Erstellen Sie ein neues Konto. Die Freischaltung erfolgt manuell durch den Administrator.</p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/35 rounded-xl flex items-start space-x-3 text-rose-300 text-xs">
                      <ShieldAlert className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="leading-tight">{regError}</p>
                    </div>
                  )}

                  {regSuccess ? (
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/35 rounded-xl space-y-4 text-xs animate-fade-in">
                      <div className="flex items-start space-x-3">
                        <ShieldAlert className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-emerald-400">Registrierung erfolgreich!</p>
                          <p className="text-slate-300 mt-1 leading-normal">
                            Ihre Daten wurden sicher im System hinterlegt. Ihr Account wartet nun auf administrative Aktivierung. Sie können sich einloggen, sobald der Administrator Sie freigeschaltet hat.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsRegistering(false); setLoginError(null); }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors cursor-pointer"
                      >
                        Zurück zur Anmeldung
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Voller Name *</label>
                          <input
                            type="text"
                            placeholder="z.B. Anna Schmidt"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs focus:border-blue-500 focus:bg-slate-905 transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Firma / Unternehmen</label>
                          <input
                            type="text"
                            placeholder="z.B. Muster GmbH"
                            value={regCompany}
                            onChange={(e) => setRegCompany(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs focus:border-blue-500 focus:bg-slate-905 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">E-Mail *</label>
                          <input
                            type="email"
                            placeholder="anna.schmidt@mail.de"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs focus:border-blue-500 focus:bg-slate-905 transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Telefonnummer</label>
                          <input
                            type="text"
                            placeholder="+49 170 1234567"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs focus:border-blue-500 focus:bg-slate-905 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Straße, PLZ & Stadt (Adresse)</label>
                        <input
                          type="text"
                          placeholder="Musterstraße 12, 12345 Berlin"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs focus:border-blue-500 focus:bg-slate-905 transition-all"
                        />
                      </div>

                      <div className="border-t border-slate-900 my-1 pt-1"></div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">Benutzername *</label>
                          <input
                            type="text"
                            placeholder="anna.schmidt"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-lg py-2 px-3 outline-none text-xs focus:border-blue-500 focus:bg-slate-905 transition-all font-mono"
                            required
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Passwort *</label>
                            <button
                              type="button"
                              onClick={() => {
                                const pass = generateStrongPassword(allowedSpecialSymbols.join(''));
                                setRegPassword(pass);
                                setShowRegPassword(true);
                              }}
                              className="text-[9px] text-blue-400 hover:text-blue-300 font-bold transition-all cursor-pointer flex items-center gap-1 font-mono"
                              title="Ein sicheres, zufälliges Passwort automatisch generieren"
                            >
                              <Key className="w-2.5 h-2.5 animate-pulse" />
                              <span>Generieren</span>
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showRegPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-lg py-2 pl-3 pr-16 outline-none text-xs focus:border-blue-500 focus:bg-slate-905 transition-all font-mono"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-1 text-[8px] font-bold text-slate-400 hover:text-white transition-all bg-slate-800 rounded font-mono cursor-pointer"
                            >
                              {showRegPassword ? "AUS" : "ANZEIGEN"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sonderzeichen-Auswahl für Passwort-Generator */}
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/60 mt-1">
                        <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-bold">
                          Sonderzeichen für Passwort-Generator:
                        </span>
                        <div className="grid grid-cols-5 gap-1.5">
                          {['!', '@', '#', '$', '%', '&', '*', '?', '_', '-'].map((sym) => {
                            const isSelected = allowedSpecialSymbols.includes(sym);
                            return (
                              <button
                                key={sym}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setAllowedSpecialSymbols(allowedSpecialSymbols.filter(s => s !== sym));
                                  } else {
                                    setAllowedSpecialSymbols([...allowedSpecialSymbols, sym]);
                                  }
                                }}
                                className={`h-7 rounded flex items-center justify-center font-mono text-xs font-bold transition-all border cursor-pointer ${
                                  isSelected 
                                    ? 'bg-blue-600/35 border-blue-500 text-blue-300 shadow-xs' 
                                    : 'bg-slate-900/50 border-slate-850 text-slate-500 hover:border-slate-800 hover:text-slate-350'
                                }`}
                              >
                                {sym}
                              </button>
                            );
                          })}
                        </div>
                        <span className="block text-[8px] text-slate-500 font-mono mt-1 pr-1 text-right">
                          Gewählt: {allowedSpecialSymbols.length > 0 ? allowedSpecialSymbols.join(' ') : 'Keine (nur Buchstaben/Zahlen)'}
                        </span>
                      </div>

                      {/* Visual Strength Indicator */}
                      {regPassword && (
                        <div className="mt-1 space-y-2.5 p-2.5 bg-slate-900/40 border border-slate-800/40 rounded-lg">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-400 font-mono">Sicherheitsstärke:</span>
                            <span className={`font-bold font-mono ${getPasswordStrength(regPassword).textColor}`}>
                              {getPasswordStrength(regPassword).label}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`h-1.5 rounded transition-all duration-350 ${
                                  step <= getPasswordStrength(regPassword).score
                                    ? getPasswordStrength(regPassword).bgClass
                                    : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Requirements Checklist */}
                          <div className="pt-2 border-t border-slate-800/50 space-y-1">
                            <p className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Sicherheitsanforderungen:
                            </p>
                            <div className="grid grid-cols-1 gap-1 text-[9px]">
                              {getPasswordRules(regPassword).map((rule, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 font-mono">
                                  {rule.met ? (
                                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <X className="w-3 h-3 text-rose-500 flex-shrink-0" />
                                  )}
                                  <span className={rule.met ? 'text-slate-350 line-through decoration-slate-600/60' : 'text-slate-450'}>
                                    {rule.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                      >
                        Registrierungsanfrage einreichen
                      </button>

                      <div className="text-center mt-3">
                        <button
                          type="button"
                          onClick={() => { setIsRegistering(false); setRegError(null); }}
                          className="text-[11px] text-slate-400 hover:text-white transition-colors underline bg-transparent border-none cursor-pointer"
                        >
                          Zurück zur Anmeldung
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* LOGIN CHASSIS */
                <div className="space-y-8">
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Portal Anmeldung</h2>
                    <p className="text-sm text-slate-400 mt-1.5">Wählen Sie Ihren Kontotyp und tragen Sie Ihre Login-Daten ein.</p>
                  </div>

                  {/* Login Role Toggle tabs */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setLoginRole('admin'); setLoginError(null); }}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                        loginRole === 'admin' 
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      Admin (CRM-Leitung)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginRole('customer'); setLoginError(null); }}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                        loginRole === 'customer' 
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      Mandant (Kundenportal)
                    </button>
                  </div>

                  {/* Login error warnings card */}
                  {loginError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/35 rounded-xl flex items-start space-x-3 text-rose-300 text-xs animate-shake">
                      <ShieldAlert className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="leading-normal">{loginError}</p>
                    </div>
                  )}

                  {/* Actual verification form */}
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Benutzername</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          id="input-username"
                          type="text"
                          placeholder={loginRole === 'admin' ? 'z.B. admin' : 'z.B. max.muster'}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={lockoutUntil !== null}
                          className="w-full bg-slate-900/60 border border-slate-800/90 text-white rounded-xl py-3 pl-11 pr-4 outline-none text-sm focus:border-blue-500 focus:bg-slate-900 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Passwort</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="input-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={lockoutUntil !== null}
                          className="w-full bg-slate-900/60 border border-slate-800/90 text-white rounded-xl py-3 pl-11 pr-4 outline-none text-sm focus:border-blue-500 focus:bg-slate-900 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      {loginRole === 'customer' && (
                        <div className="flex justify-end mt-1.5 pr-1">
                          <button
                            type="button"
                            onClick={() => alert(`Sicherheits-Information:\n\nBitte kontaktieren Sie Ihren Ansprechpartner (${data.adminProfile?.name || 'Administrator'}), um Ihr Passwort im CRM-System zurücksetzen zu lassen.`)}
                            className="text-xs text-slate-400 hover:text-white transition-colors underline bg-transparent border-none cursor-pointer"
                          >
                            Passwort vergessen?
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      id="btn-submit"
                      type="submit"
                      disabled={isVerifying || lockoutUntil !== null}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 hover:scale-[1.015] hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] disabled:bg-slate-800 disabled:scale-100 disabled:shadow-none text-white font-semibold text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-600/10 cursor-pointer disabled:text-slate-500 disabled:border-slate-700/50"
                    >
                      {lockoutUntil !== null 
                        ? `Temporär gesperrt (${lockoutCountdown}s)` 
                        : isVerifying 
                          ? 'Anmeldung wird geprüft...' 
                          : 'Im Portal anmelden'}
                    </button>

                    {loginRole === 'customer' && (
                      <div className="text-center mt-6 pt-4 border-t border-slate-900/30">
                        <button
                          type="button"
                          onClick={() => { setIsRegistering(true); setRegError(null); setRegSuccess(false); }}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors bg-transparent border-none font-semibold cursor-pointer"
                        >
                          Noch kein Mandantenkonto? Jetzt registrieren
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
