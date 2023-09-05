

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
	docker-compose down --rmi all --remove-orphans
	# Please delete your db-data, check with docker volume ls
	#docker volume rm transcendence_db-data

reset: fclean