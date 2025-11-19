import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
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

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CertificateForm>({
    resolver: zodResolver(certificateSchema)
  });

  const filteredCertificates = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return certificates;
    return certificates.filter((item) => {
      return (
        item.cpf.includes(onlyDigits(term)) ||
        item.registro.toLowerCase().includes(term) ||
        item.nome.toLowerCase().includes(term) ||
        item.curso.toLowerCase().includes(term)
      );
    });
  }, [certificates, filter]);

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

  const onSubmit = async (values: CertificateForm) => {
    const payload: CertificatePayload = {
      ...values,
      cpf: onlyDigits(values.cpf),
      inicio: new Date(values.inicio).toISOString(),
      fim: new Date(values.fim).toISOString()
    };

    try {
      const { data } = await api.post<Certificate>('/certificates', payload);
      toast.success('Certificado cadastrado.');
      setCertificates((prev) => [data, ...prev]);
      reset();
    } catch (error: unknown) {
      toast.error('Erro ao cadastrar certificado.');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este certificado?')) return;
    try {
      await api.delete(`/certificates/${id}`);
      toast.success('Certificado removido.');
      setCertificates((prev) => prev.filter((item) => item.id !== id));
    } catch {
      toast.error('Erro ao remover certificado.');
    }
  };

  return (
    <Container className="py-4">
      <header className="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <p className="text-muted mb-0">Bem-vindo, {user?.email}</p>
          <h1 className="h3 fw-bold mb-0">Painel de Certificados</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={fetchCertificates}>
            Atualizar lista
          </Button>
          <Button variant="outline-danger" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>

      <Row className="g-4">
        <Col lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-3">Cadastrar certificado</Card.Title>
              <Form className="d-grid gap-3" onSubmit={handleSubmit(onSubmit)}>
                <div>
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
                  <Form.Control.Feedback type="invalid" className="d-block">
                    CPF obrigatório
                  </Form.Control.Feedback>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Label>Registro</Form.Label>
                    <Form.Control type="text" {...register('registro')} isInvalid={!!errors.registro} />
                    <Form.Control.Feedback type="invalid">Informe o registro</Form.Control.Feedback>
                  </div>
                  <div className="col-md-6">
                    <Form.Label>Matrícula</Form.Label>
                    <Form.Control type="text" {...register('matricula')} isInvalid={!!errors.matricula} />
                    <Form.Control.Feedback type="invalid">Informe a matrícula</Form.Control.Feedback>
                  </div>
                </div>
                <div>
                  <Form.Label>Nome</Form.Label>
                  <Form.Control type="text" {...register('nome')} isInvalid={!!errors.nome} />
                  <Form.Control.Feedback type="invalid">Informe o nome</Form.Control.Feedback>
                </div>
                <div>
                  <Form.Label>Curso</Form.Label>
                  <Form.Control type="text" {...register('curso')} isInvalid={!!errors.curso} />
                  <Form.Control.Feedback type="invalid">Informe o curso</Form.Control.Feedback>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Form.Label>Início</Form.Label>
                    <Form.Control type="date" {...register('inicio')} isInvalid={!!errors.inicio} />
                  </div>
                  <div className="col-md-6">
                    <Form.Label>Término</Form.Label>
                    <Form.Control type="date" {...register('fim')} isInvalid={!!errors.fim} />
                  </div>
                </div>
                <Button type="submit" variant="danger">
                  Salvar
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                <div>
                  <Card.Title className="mb-1">Certificados cadastrados</Card.Title>
                  <Card.Subtitle className="text-muted">
                    {filteredCertificates.length} registros encontrados
                  </Card.Subtitle>
                </div>
                <Form.Control
                  type="search"
                  placeholder="Filtrar por CPF, registro ou nome..."
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                />
              </div>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>CPF</th>
                      <th>Registro</th>
                      <th>Nome</th>
                      <th>Curso</th>
                      <th>Início</th>
                      <th>Término</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          Carregando certificados...
                        </td>
                      </tr>
                    ) : filteredCertificates.length ? (
                      filteredCertificates.map((item) => (
                        <tr key={item.id}>
                          <td>{item.cpf}</td>
                          <td>{item.registro}</td>
                          <td>{item.nome}</td>
                          <td>{item.curso}</td>
                          <td>{formatDate(item.inicio)}</td>
                          <td>{formatDate(item.fim)}</td>
                          <td className="text-end">
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          Nenhum certificado encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
