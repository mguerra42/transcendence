

all:
	if [ ! -f .env ]; then cp .env.example .env; fi
	docker-compose up --build -d
	docker-compose exec backend npx prisma db push
	#docker-compose exec backend npx prisma db seed
	docker-compose logs -f

start: all

logs:
	docker-compose logs -f

debug: logs

re: clean start

clean:
	docker-compose down --remove-orphans

stop: clean

fclean: clean
	docker volume rm ft_transcendence_db-data
	docker-compose down --rmi all --remove-orphans

reset: fclean