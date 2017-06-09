BUCKET=rea-awstraining

all:
	aws s3 sync --exclude=.git/* . s3://$(BUCKET)/
