import { Request, Response } from 'express'; 
import  bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken'; 
import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();

interface RegisterBody {
    username: string; 
    email: string;
    password: string;
    phone: string;
    role?: string; 
};

interface LoginBody {
    email: string;
    password: string;
} 

class AuthControler {

    // Configuration JWT 
    private readonly JWT_SECRET = process.env.JWT_SECRET ||'your-secret-key'; // A choisir nous même
    private readonly JWT_EXPIRE_IN = '30d'; 
    private readonly REFRESH_TOKEN_IN = '30d'; 


// ---------------- Méthode UTiles ----------------------- 

// Hash Password 

 static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    
}