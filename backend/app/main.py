from fastapi import FastAPI

app = FastAPI(
    title="SmartERP API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "SmartERP Running"}