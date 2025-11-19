import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Container, Form, Modal, Table } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import type { Certificate } from '../types';
import { formatDate, maskCPF, onlyDigits } from '../utils/format';

const lookupSchema = z.object({
  cpf: z
    .string()
    .min(14, 'Informe um CPF válido')
    .max(14, 'Informe um CPF válido')
});

type LookupForm = z.infer<typeof lookupSchema>;

export const PublicLookup = () => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LookupForm>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { cpf: '' }
  });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const onSubmit = async ({ cpf }: LookupForm) => {
    const digits = onlyDigits(cpf);
    setIsLoading(true);
    try {
      const { data } = await api.get<Certificate[]>(`/certificates/lookup/${digits}`);
      setCertificates(data);
      setShowModal(true);
    } catch {
      toast.error('Nenhum certificado encontrado para o CPF informado.');
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="hero-section text-center py-5">
        <Container>
          <p className="fs-5 text-danger mb-1">Portal de Consulta</p>
          <h1 className="fw-bold mb-3">Validador de Certificados</h1>
          <p className="text-muted mb-0">
            Consulte rapidamente a autenticidade de certificados emitidos pela instituição.
          </p>
        </Container>
      </section>

      <Container className="py-4">
        <Card className="shadow border-0">
          <Card.Body>
            <Card.Title className="mb-4">Pesquisar por CPF</Card.Title>
            <Form onSubmit={handleSubmit(onSubmit)} className="row g-3">
              <div className="col-md-8">
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
                  {errors.cpf?.message}
                </Form.Control.Feedback>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <Button type="submit" variant="danger" className="w-100" disabled={isLoading}>
                  {isLoading ? 'Consultando...' : 'Consultar'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <section className="mt-5">
          <h2 className="h5 text-muted text-uppercase">Como funciona?</h2>
          <div className="row g-4 mt-1">
            <div className="col-md-4">
              <Card className="info-card">
                <Card.Body>
                  <h3>1. Informe o CPF</h3>
                  <p>Digite o CPF de quem deseja validar para localizar todos os certificados emitidos.</p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="info-card">
                <Card.Body>
                  <h3>2. Confira os dados</h3>
                  <p>
                    Os resultados exibem número de registro, matrícula, curso e datas de início e conclusão.
                  </p>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="info-card">
                <Card.Body>
                  <h3>3. Valide o certificado</h3>
                  <p>Utilize as informações apresentadas para confirmar a autenticidade junto à instituição.</p>
                </Card.Body>
              </Card>
            </div>
          </div>
        </section>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Resultado da consulta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped responsive className="align-middle">
            <thead>
              <tr>
                <th>Registro</th>
                <th>Matrícula</th>
                <th>Nome</th>
                <th>Curso</th>
                <th>Início</th>
                <th>Término</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((item) => (
                <tr key={item.id ?? `${item.cpf}-${item.registro}`}>
                  <td>{item.registro}</td>
                  <td>{item.matricula}</td>
                  <td>{item.nome}</td>
                  <td>{item.curso}</td>
                  <td>{formatDate(item.inicio)}</td>
                  <td>{formatDate(item.fim)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
