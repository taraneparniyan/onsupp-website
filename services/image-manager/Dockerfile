# =============================================================================
# Production Dockerfile for OnSupp Image Manager Service (Rust + Axum)
# =============================================================================

# --- Stage 1: Build Rust Binary ---
FROM rust:1.82-alpine AS builder

RUN apk add --no-cache musl-dev

WORKDIR /app

# Copy dependency manifests
COPY Cargo.toml Cargo.lock ./

# Create skeleton src to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

# Copy real Rust source
COPY src/main.rs ./src/main.rs

# Build release binary
RUN touch src/main.rs && cargo build --release

# --- Stage 2: Minimal Runtime Container ---
FROM alpine:3.20 AS runner

RUN apk add --no-cache ca-certificates libgcc

WORKDIR /app

COPY --from=builder /app/target/release/image-manager ./image-manager

EXPOSE 8080
ENV RUST_LOG=info

CMD ["./image-manager"]
