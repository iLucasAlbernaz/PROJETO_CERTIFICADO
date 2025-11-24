import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Certificate, CertificatePayload } from '../types';
import { formatDate, maskCPF, onlyDigits } from '../utils/format';
import { useAuth } from '../hooks/useAuth';

const certificateSchema = z.object({
  cpf: z.string().min(11),
  registro: z.string().min(1),
  matricula: z.string().min(1),
  nome: z.string().min(3),
  curso: z.string().min(3),
  inicio: z.string().min(1),
  fim: z.string().min(1)
});

type CertificateForm = z.infer<typeof certificateSchema>;

const defaultFormValues: CertificateForm = {
  cpf: '',
  registro: '',
  matricula: '',
  nome: '',
  curso: '',
  inicio: '',
  fim: ''
};

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'cpf' | 'registro' | 'nome' | 'curso'>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showList, setShowList] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CertificateForm>({
    resolver: zodResolver(certificateSchema),
    defaultValues: defaultFormValues
  });

  const filteredCertificates = useMemo(() => {
    const term = filterTerm.trim().toLowerCase();
    if (!term) return certificates;

    return certificates.filter((item) => {
      if (filterMode === 'cpf') return item.cpf.includes(onlyDigits(term));
      if (filterMode === 'registro') return item.registro.toLowerCase().includes(term);
      if (filterMode === 'nome') return item.nome.toLowerCase().includes(term);
      if (filterMode === 'curso') return item.curso.toLowerCase().includes(term);

      return (
        item.cpf.includes(onlyDigits(term)) ||
        item.registro.toLowerCase().includes(term) ||
        item.nome.toLowerCase().includes(term) ||
        item.curso.toLowerCase().includes(term)
      );
    });
  }, [certificates, filterTerm, filterMode]);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Certificate[]>('/certificates');
      setCertificates(data);
    } catch {
      toast.error('Não foi possível carregar os certificados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    if (isEditing && selectedCertificate) {
      reset({
        cpf: maskCPF(selectedCertificate.cpf),
        registro: selectedCertificate.registro,
        matricula: selectedCertificate.matricula,
        nome: selectedCertificate.nome,
        curso: selectedCertificate.curso,
        inicio: new Date(selectedCertificate.inicio).toISOString().slice(0, 10),
        fim: new Date(selectedCertificate.fim).toISOString().slice(0, 10)
      });
    } else {
      reset(defaultFormValues);
    }
  }, [isEditing, selectedCertificate, reset]);

  const onSubmit = async (values: CertificateForm) => {
    const payload: CertificatePayload = {
      ...values,
      cpf: onlyDigits(values.cpf),
      inicio: new Date(values.inicio).toISOString(),
      fim: new Date(values.fim).toISOString()
    };

    try {
      if (isEditing && selectedCertificate) {
        const { data } = await api.put<Certificate>(`/certificates/${selectedCertificate.id}`, payload);
        toast.success('Certificado atualizado.');
        setCertificates((prev) => prev.map((item) => (item.id === data.id ? data : item)));
        setSelectedCertificate(data);
      } else {
        const { data } = await api.post<Certificate>('/certificates', payload);
        toast.success('Certificado cadastrado.');
        setCertificates((prev) => [data, ...prev]);
        setSelectedCertificate(data);
      }
      reset(defaultFormValues);
      setIsEditing(false);
    } catch (error: unknown) {
      toast.error('Erro ao salvar certificado.');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este certificado?')) return;
    try {
      await api.delete(`/certificates/${id}`);
      toast.success('Certificado removido.');
      setCertificates((prev) => prev.filter((item) => item.id !== id));
      if (selectedCertificate?.id === id) {
        setSelectedCertificate(null);
        setIsEditing(false);
      }
    } catch {
      toast.error('Erro ao remover certificado.');
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsEditing(true);
    if (!showList) setShowList(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedCertificate(null);
    reset(defaultFormValues);
  };

  return (
    <div className="dashboard-shell">
      <div className="top-accent" />
      <div className="split-layout">
        <aside className="panel-left">
          <div className="panel-inner">
            <div className="panel-header">
              <p className="text-uppercase text-danger fw-semibold mb-1">Painel administrativo</p>
              <h2 className="panel-title">{isEditing ? 'Editar certificado' : 'Cadastrar novo certificado'}</h2>
              <p className="panel-subtitle">Preencha os dados para registrar ou atualizar um certificado.</p>
              <Link to="/" className="back-link">
                ← Voltar para consulta pública
              </Link>
            </div>
            <Form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid-full">
                <Form.Label>CPF</Form.Label>
                <Controller
                  control={control}
                  name="cpf"
                  render={({ field }) => (
                    <Form.Control
                      {...field}
                      type="text"
                      placeholder="000.000.000-00"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(maskCPF(event.target.value))}
                      isInvalid={!!errors.cpf}
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid" className="d-block text-danger">
                  CPF obrigatório
                </Form.Control.Feedback>
              </div>

              <div className="grid-inline">
                <div>
                  <Form.Label>Registro</Form.Label>
                  <Form.Control type="text" {...register('registro')} isInvalid={!!errors.registro} />
                  <Form.Control.Feedback type="invalid">Informe o registro</Form.Control.Feedback>
                </div>
                <div>
                  <Form.Label>Matrícula</Form.Label>
                  <Form.Control type="text" {...register('matricula')} isInvalid={!!errors.matricula} />
                  <Form.Control.Feedback type="invalid">Informe a matrícula</Form.Control.Feedback>
                </div>
              </div>

              <div className="grid-full">
                <Form.Label>Nome</Form.Label>
                <Form.Control type="text" {...register('nome')} isInvalid={!!errors.nome} />
                <Form.Control.Feedback type="invalid">Informe o nome</Form.Control.Feedback>
              </div>

              <div className="grid-full">
                <Form.Label>Curso</Form.Label>
                <Form.Control type="text" {...register('curso')} isInvalid={!!errors.curso} />
                <Form.Control.Feedback type="invalid">Informe o curso</Form.Control.Feedback>
              </div>

              <div className="grid-inline">
                <div>
                  <Form.Label>Início</Form.Label>
                  <Form.Control type="date" {...register('inicio')} isInvalid={!!errors.inicio} />
                </div>
                <div>
                  <Form.Label>Término</Form.Label>
                  <Form.Control type="date" {...register('fim')} isInvalid={!!errors.fim} />
                </div>
              </div>

              <div className="grid-full">
                <Button type="submit" className="primary-action w-100">
                  {isEditing ? 'Salvar alterações' : 'Salvar certificado'}
                </Button>
                {isEditing && (
                  <Button variant="outline-secondary" className="w-100 mt-2" onClick={handleCancelEdit}>
                    Cancelar edição
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </aside>

        <main className="panel-right">
          <section className="dashboard-header mb-4">
            <div>
              <p className="text-uppercase text-danger fw-semibold mb-1">Painel administrativo</p>
              <h1 className="title">Gestão de certificados</h1>
              <p className="subtitle">Gerencie o acervo da Faculdade Guerra em tempo real.</p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Button variant="outline-danger" className="header-btn" onClick={fetchCertificates}>
                Atualizar lista
              </Button>
              <button className="link-logout" onClick={logout} type="button">
                Sair ({user?.email})
              </button>
            </div>
          </section>

          <div className="list-toggle">
            <Button
              variant={showList ? 'outline-secondary' : 'outline-danger'}
              onClick={() => setShowList((prev) => !prev)}
            >
              {showList ? 'Ocultar certificados cadastrados' : 'Ver certificados cadastrados'}
            </Button>
          </div>

          {showList && (
            <Card className="card-surface list-card">
              <Card.Body>
                <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
                  <div>
                    <Card.Title className="mb-1">Certificados cadastrados</Card.Title>
                    <Card.Subtitle className="text-muted">
                      {filteredCertificates.length} registros encontrados
                    </Card.Subtitle>
                  </div>
                  <div className="d-flex flex-column flex-lg-row gap-2 w-100">
                    <div className="filter-chips">
                      {['all', 'cpf', 'registro', 'nome', 'curso'].map((mode) => (
                        <button
                          type="button"
                          key={mode}
                          className={filterMode === mode ? 'chip active' : 'chip'}
                          onClick={() => setFilterMode(mode as typeof filterMode)}
                        >
                          {mode === 'all'
                            ? 'Todos'
                            : mode === 'cpf'
                            ? 'CPF'
                            : mode === 'registro'
                            ? 'Registro'
                            : mode === 'nome'
                            ? 'Nome'
                            : 'Curso'}
                        </button>
                      ))}
                    </div>
                    <div className="search-field w-100">
                      <FiSearch className="icon" size={18} />
                      <Form.Control
                        className="search-input"
                        type="search"
                        placeholder={
                          filterMode === 'all'
                            ? 'Filtrar por CPF, registro ou nome...'
                            : `Buscar por ${filterMode}`
                        }
                        value={filterTerm}
                        onChange={(event) => setFilterTerm(event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <p className="text-center py-4 mb-0">Carregando certificados...</p>
                ) : filteredCertificates.length ? (
                  <div className="cert-card-grid">
                    {filteredCertificates.map((item) => (
                      <div key={item.id} className="cert-card">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="label">Curso</span>
                            <h5 className="mb-0">{item.curso}</h5>
                          </div>
                          <span className="badge rounded-pill">#{item.registro}</span>
                        </div>
                        <div className="cert-meta">
                          <div>
                            <span>Nome</span>
                            <strong>{item.nome}</strong>
                          </div>
                          <div>
                            <span>CPF</span>
                            <strong>{item.cpf}</strong>
                          </div>
                          <div>
                            <span>Período</span>
                            <strong>
                              {formatDate(item.inicio)} · {formatDate(item.fim)}
                            </strong>
                          </div>
                        </div>
                        <div className="card-actions">
                          <button
                            className="icon-button"
                            type="button"
                            onClick={() => handleEdit(item)}
                            aria-label="Editar certificado"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            className="icon-button"
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            aria-label="Remover certificado"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 mb-0">Nenhum certificado encontrado.</p>
                )}
              </Card.Body>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};
