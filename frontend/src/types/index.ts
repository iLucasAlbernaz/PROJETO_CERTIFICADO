export interface Certificate {
  id: string;
  cpf: string;
  registro: string;
  matricula: string;
  nome: string;
  curso: string;
  inicio: string;
  fim: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CertificatePayload {
  cpf: string;
  registro: string;
  matricula: string;
  nome: string;
  curso: string;
  inicio: string;
  fim: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}
