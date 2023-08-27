

all:
	docker-compose up --build -d
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

reset: fclean