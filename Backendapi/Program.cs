using Backendapi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                "http://127.0.0.1:3000",
                "https://127.0.0.1:3000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS before other middleware
app.UseCors("AllowFrontend");

// Comment out HTTPS redirection for local development
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Add logging middleware
app.Use(async (context, next) =>
{
    Console.WriteLine($"Incoming request: {context.Request.Method} {context.Request.Path}");
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error processing request: {ex.Message}");
        throw;
    }
});

app.Run();
