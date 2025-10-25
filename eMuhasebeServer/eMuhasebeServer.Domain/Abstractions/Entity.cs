namespace eMuhasebeServer.Domain.Abstractions
{
    public abstract class Entity
    {
    public bool IsDeleted { get; set; } = false;
    
    public Guid Id { get; set; }
    protected Entity()
        {
            Id = Guid.NewGuid();
        }
    }
}
