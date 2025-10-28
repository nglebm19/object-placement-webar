from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.ping import router as ping_router
from routers.save import router as save_router

app = FastAPI(
    title="WebXR Object Placement API",
    description="Simple API backing the WebXR object placement demo.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(ping_router)
app.include_router(save_router)


@app.get("/")
def read_root() -> dict:
    return {"message": "WebXR Object Placement API"}
