import argparse

from .server import executar

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ciclo Concursos")
    parser.add_argument("--porta", type=int, default=8756)
    parser.add_argument("--sem-navegador", action="store_true")
    args = parser.parse_args()
    executar(porta=args.porta, abrir=not args.sem_navegador)
