from fastapi import FastAPI

app = FastAPI(title="Urbidata API", description="API for urban mobility in Malaga and Seville")

@app.get("/")
async def root():
    return {"message": "Welcome to Urbidata API", "status": "online"}
