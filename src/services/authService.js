import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export const registerUser = async (userData) => {
  try {
    // Check if auth is properly initialized
    if (!auth) {
      throw new Error('Firebase Auth no está configurado correctamente');
    }

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const user = userCredential.user;
    
    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: userData.name,
      email: userData.email,
      birthdate: userData.birthdate,
      country: userData.country,
      city: userData.city,
      createdAt: new Date(),
      uid: user.uid
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = error.message;
    
    if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Firebase Authentication no está habilitado. Contacta al administrador.';
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email ya está registrado.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'La contraseña es muy débil.';
    } else if (error.code === 'permission-denied') {
      errorMessage = 'Error de permisos. Contacta al administrador.';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loginUser = async (email, password) => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth no está configurado correctamente');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    return { success: true, user, userData };
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = error.message;
    
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Email o contraseña incorrectos. Verifica tus datos.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No existe una cuenta con este email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Contraseña incorrecta.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Esta cuenta ha sido deshabilitada.';
    }
    
    return { success: false, error: errorMessage };
  }
};